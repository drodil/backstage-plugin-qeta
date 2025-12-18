import {
  AnswerCommentStatus,
  Comment as QetaComment,
} from '@drodil/backstage-plugin-qeta-common';
import { CommentOptions, MaybeComment } from '../QetaStore';
import { Knex } from 'knex';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { QetaFilters } from '../../service/util';
import { BaseStore } from './BaseStore';

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
  constructor(protected readonly db: Knex) {
    super(db);
  }

  async commentPost(
    post_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<void> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        postId: post_id,
      })
      .into('comments');
    await this.db('posts').where('id', post_id).increment('commentsCount', 1);
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
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        answerId: answer_id,
      })
      .into('comments');
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
}
