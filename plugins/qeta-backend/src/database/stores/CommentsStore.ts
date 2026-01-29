import {
  AnswerCommentStatus,
  Comment as QetaComment,
} from '@drodil/backstage-plugin-qeta-common';
import { CommentOptions, MaybeComment } from '../QetaStore';
import { Knex } from 'knex';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { QetaFilters } from '../../service/util';
import { BaseStore } from './BaseStore';
import { Config } from '@backstage/config';

export interface RawCommentEntity {
  id: number;
  author: string;
  content: string;
  created: Date;
  updated: Date;
  updatedBy: string;
  status: string;
  postId?: number;
  answerId?: number;
}

export class CommentsStore extends BaseStore {
  constructor(protected readonly db: Knex, private readonly config: Config) {
    super(db);
  }

  async commentPost(
    post_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<void> {
    const ret = await this.db
      .insert({
        author: user_ref,
        content,
        created,
        postId: post_id,
      })
      .into('comments')
      .returning('id');
    await this.db('posts').where('id', post_id).increment('commentsCount', 1);
    await this.updateCommentLinks(post_id, content, undefined, ret[0].id);
  }

  async updatePostComment(
    post_id: number,
    id: number,
    user_ref: string,
    content: string,
  ): Promise<void> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('postId', '=', post_id);
    await query.update({ content, updatedBy: user_ref, updated: new Date() });
    await this.updateCommentLinks(post_id, content, undefined, id);
  }

  async deletePostComment(
    post_id: number,
    id: number,
    permanently?: boolean,
  ): Promise<void> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('postId', '=', post_id);
    if (permanently) {
      await query.delete();
    } else {
      await query.update({ status: 'deleted' });
    }
    await this.db('posts').where('id', post_id).decrement('commentsCount', 1);
  }

  async commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<void> {
    const ret = await this.db
      .insert({
        author: user_ref,
        content,
        created,
        answerId: answer_id,
      })
      .into('comments')
      .returning('id');
    await this.updateCommentLinks(undefined, content, answer_id, ret[0].id);
  }

  async updateAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    content: string,
  ): Promise<void> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);
    await query.update({ content, updatedBy: user_ref, updated: new Date() });
    await this.updateCommentLinks(undefined, content, answer_id, id);
  }

  async deleteAnswerComment(
    answer_id: number,
    id: number,
    permanently?: boolean,
  ): Promise<void> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);
    if (permanently) {
      await query.delete();
    } else {
      await query.update({ status: 'deleted' });
    }
  }

  async getComments(
    options?: { ids?: number[] },
    opts?: CommentOptions,
  ): Promise<QetaComment[]> {
    const { includeStatusFilter = true } = opts ?? {};
    const query = this.db<RawCommentEntity>('comments').orderBy('created');
    if (options?.ids) {
      query.whereIn('id', options.ids);
    }
    if (includeStatusFilter) {
      query.where('status', '=', 'active');
    }
    const rows = await query.select();
    return rows.map(val => this.mapComment(val));
  }

  async getComment(
    commentId: number,
    opts?: CommentOptions & { postId?: number; answerId?: number },
  ): Promise<MaybeComment> {
    const { includeStatusFilter = true } = opts ?? {};
    const query = this.db<RawCommentEntity>('comments').where('id', commentId);

    if (includeStatusFilter) {
      query.where('status', '=', 'active');
    }

    if (opts?.postId) {
      query.where('postId', '=', opts.postId);
    }

    if (opts?.answerId) {
      query.where('answerId', '=', opts.answerId);
    }

    const rows = await query.select();
    if (rows.length === 0) {
      return null;
    }
    return this.mapComment(rows[0]);
  }

  async getPostComments(
    postId: number | number[],
    commentsFilter?: PermissionCriteria<QetaFilters>,
    opts?: CommentOptions,
  ): Promise<(QetaComment & { postId: number })[]> {
    const { includeStatusFilter = true } = opts ?? {};
    const query = this.db<RawCommentEntity>('comments').orderBy('created');

    if (Array.isArray(postId)) {
      query.whereIn('comments.postId', postId);
    } else {
      query.where('comments.postId', '=', postId);
    }

    if (includeStatusFilter) {
      query.where('comments.status', '=', 'active');
    }
    if (commentsFilter) {
      this.parseFilter(commentsFilter, query, this.db, 'comments');
    }
    const rows = await query.select();
    return rows.map(val => ({
      ...this.mapComment(val),
      postId: val.postId!,
    }));
  }

  async getAnswerComments(
    answerId: number | number[],
    commentsFilter?: PermissionCriteria<QetaFilters>,
    opts?: CommentOptions,
  ): Promise<(QetaComment & { answerId: number })[]> {
    const { includeStatusFilter = true } = opts ?? {};
    const query = this.db<RawCommentEntity>('comments').orderBy('created');

    if (Array.isArray(answerId)) {
      query.whereIn('comments.answerId', answerId);
    } else {
      query.where('comments.answerId', '=', answerId);
    }

    if (includeStatusFilter) {
      query.where('comments.status', '=', 'active');
    }
    if (commentsFilter) {
      this.parseFilter(commentsFilter, query, this.db, 'comments');
    }
    const rows = await query.select();
    return rows.map(val => ({
      ...this.mapComment(val),
      answerId: val.answerId!,
    }));
  }

  private mapComment(val: RawCommentEntity): QetaComment {
    return {
      id: val.id,
      author: val.author,
      content: val.content,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      status: val.status as AnswerCommentStatus,
    };
  }

  async backfillLinks() {
    const route = this.config?.getOptionalString('qeta.route') ?? 'qeta';
    const comments = await this.db('comments')
      .select('id', 'postId', 'answerId', 'content')
      .where('content', 'like', `%/${route}/%`);
    for (const comment of comments) {
      await this.updateCommentLinks(
        comment.postId,
        comment.content,
        comment.answerId,
        comment.id,
      );
    }
  }

  private async updateCommentLinks(
    postId?: number,
    content?: string,
    answerId?: number,
    commentId?: number,
  ) {
    if (!content || !commentId) {
      return;
    }
    const ids = new Set<number>();
    const route = this.config.getOptionalString('qeta.route') ?? 'qeta';
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idRegex = new RegExp(
      `\\/${escapedRoute}\\/(?:questions|articles|links)\\/(\\d+)`,
      'g',
    );
    for (const match of content.matchAll(idRegex)) {
      const id = parseInt(match[1], 10);
      if (!isNaN(id) && id !== postId) {
        ids.add(id);
      }
    }

    if (ids.size > 0) {
      await this.db('post_links').where('viaCommentId', commentId).delete();
      // If postId is undefined, we need to find it from answer
      let actualPostId = postId;
      if (!actualPostId && answerId) {
        const answer = await this.db('answers')
          .select('postId')
          .where('id', answerId)
          .first();
        if (answer) {
          actualPostId = answer.postId;
        }
      }

      if (actualPostId) {
        const inserts = Array.from(ids).map(linkedPostId => ({
          postId: actualPostId,
          linkedPostId,
          viaCommentId: commentId,
        }));
        await this.db('post_links')
          .insert(inserts)
          .onConflict(['postId', 'linkedPostId'])
          .ignore();
      }
    }
  }
}
