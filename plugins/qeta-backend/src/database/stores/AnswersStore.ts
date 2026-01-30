import {
  Answer,
  AnswersQuery,
  AnswerCommentStatus,
  Comment as QetaComment,
  PostsQuery,
} from '@drodil/backstage-plugin-qeta-common';
import {
  AnswerOptions,
  Answers,
  MaybeAnswer,
  MaybePost,
  Posts,
} from '../QetaStore';
import { Knex } from 'knex';
import { CommentsStore } from './CommentsStore';
import { AttachmentsStore } from './AttachmentsStore';
import { extractPostIds, QetaFilters } from '../../service/util';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { BaseStore } from './BaseStore';
import { Config } from '@backstage/config';

export interface RawAnswerEntity {
  id: number;
  postId: number;
  author: string;
  content: string;
  correct: boolean;
  score: number | string;
  created: Date;
  updated: Date;
  updatedBy: string;
  anonymous: boolean;
  status: string;
}

export interface RawAnswerVoteEntity {
  answerId: number;
  author: string;
  score: number;
  timestamp: Date;
}

export class AnswersStore extends BaseStore {
  constructor(
    protected readonly db: Knex,
    private readonly commentsStore: CommentsStore,
    private readonly postsStore: {
      getPost(
        user_ref: string,
        id: number,
        recordView?: boolean,
      ): Promise<MaybePost>;
      getPosts(user_ref: string, options: PostsQuery): Promise<Posts>;
    },
    private readonly attachmentsStore: AttachmentsStore,
    private readonly config: Config,
  ) {
    super(db);
  }

  async getAnswers(
    user_ref: string,
    options: AnswersQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: AnswerOptions,
  ): Promise<Answers> {
    const query = this.getAnswerBaseQuery();

    if (options.author) {
      query.where('answers.author', '=', options.author);
    }

    if (filters) {
      this.parseFilter(filters, query, this.db, 'answer');
    }

    if (options.searchQuery) {
      this.applySearchQuery(query, ['answers.content'], options.searchQuery);
    }

    if (options.questionId) {
      query.where('answers.postId', '=', options.questionId);
    }

    if (options.noVotes) {
      query.whereNull('answer_votes.answerId');
    }

    if (opts?.correct !== undefined) {
      query.where('answers.correct', '=', opts.correct);
    }

    const totalQuery = query.clone();

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order ? options.order : 'desc');
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);

    const rows = results[0] as RawAnswerEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      answers: await this.mapAnswerEntities(rows, user_ref, opts),
      total,
    };
  }

  async getAnswer(
    answerId: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const query = this.getAnswerBaseQuery().where('answers.id', '=', answerId);
    if (options?.filter) {
      this.parseFilter(options.filter, query, this.db, 'answer');
    }

    if (options?.correct !== undefined) {
      query.where('answers.correct', '=', options.correct);
    }

    const rows = await query.select();
    if (rows.length === 0) {
      return null;
    }
    return (
      await this.mapAnswerEntities(
        [rows[0] as unknown as RawAnswerEntity],
        user_ref,
        options,
      )
    )[0];
  }

  async getPostAnswers(
    postId: number | number[],
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<Answer[]> {
    const { includeStatusFilter = true } = options ?? {};
    const query = this.getAnswerBaseQuery()
      .orderBy('answers.correct', 'desc')
      .orderBy('answers.created');

    if (Array.isArray(postId)) {
      query.whereIn('postId', postId);
    } else {
      query.where('postId', '=', postId);
    }

    if (includeStatusFilter) {
      query.where('answers.status', '=', 'active');
    }

    if (options?.filter) {
      this.parseFilter(options.filter, query, this.db, 'answer');
    }

    const rows = await query.select();
    return this.mapAnswerEntities(rows, user_ref, options);
  }

  async answerPost(
    user_ref: string,
    questionId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const answers = await this.db
      .insert(
        {
          postId: questionId,
          author: user_ref,
          content: answer,
          created,
          correct: false,
          anonymous: anonymous ?? false,
        },
        ['id'],
      )
      .into('answers')
      .returning('id');

    await this.db('posts').where('id', questionId).increment('answersCount', 1);

    if (images && images.length > 0) {
      await this.updateAttachments('answerId', answer, images, answers[0].id);
    }

    const hasInteracted = await (this.postsStore as any).hasUserInteracted(
      user_ref,
      questionId,
    );
    if (!hasInteracted) {
      await (this.postsStore as any).followPost(user_ref, questionId);
    }

    return this.getAnswer(answers[0].id, user_ref, options);
  }

  async updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    author?: string,
    images?: number[],
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const query = this.db('answers')
      .where('id', '=', answerId)
      .where('postId', '=', questionId);

    await query.update({
      content: answer,
      updatedBy: user_ref,
      updated: new Date(),
      author: author,
    });

    if (images) {
      await this.updateAttachments('answerId', answer, images, answerId);
    }

    return this.getAnswer(answerId, user_ref, options);
  }

  async deleteAnswer(id: number, permanently?: boolean): Promise<boolean> {
    const answer = await this.db('answers')
      .select('postId')
      .where('id', id)
      .first();

    if (permanently) {
      const rows = await this.db('answers').where('id', '=', id).delete();
      if (answer && rows > 0) {
        await this.db('posts')
          .where('id', answer.postId)
          .decrement('answersCount', 1);
      }
      return rows > 0;
    }
    const rows = await this.db('answers').where('id', '=', id).update({
      status: 'deleted',
    });
    if (answer && rows > 0) {
      await this.db('posts')
        .where('id', answer.postId)
        .decrement('answersCount', 1);
    }
    return rows > 0;
  }

  async voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean> {
    await this.db('answer_votes')
      .where('author', '=', user_ref)
      .where('answerId', '=', answerId)
      .delete();

    await this.db
      .insert({
        author: user_ref,
        answerId,
        score,
        timestamp: new Date(),
      })
      .into('answer_votes');

    await this.db('answers')
      .where('id', '=', answerId)
      .update({
        score: this.db('answer_votes')
          .where('answerId', '=', answerId)
          .select(this.db.raw('COALESCE(SUM(score), 0)')),
      });
    return true;
  }

  async deleteAnswerVote(user_ref: string, answerId: number): Promise<boolean> {
    const rows = await this.db('answer_votes')
      .where('author', '=', user_ref)
      .where('answerId', '=', answerId)
      .delete();

    if (rows > 0) {
      await this.db('answers')
        .where('id', '=', answerId)
        .update({
          score: this.db('answer_votes')
            .where('answerId', '=', answerId)
            .select(this.db.raw('COALESCE(SUM(score), 0)')),
        });
    }
    return rows > 0;
  }

  async markAnswerCorrect(postId: number, answerId: number): Promise<boolean> {
    return this.markAnswer(postId, answerId, true);
  }

  async markAnswerIncorrect(
    postId: number,
    answerId: number,
  ): Promise<boolean> {
    return this.markAnswer(postId, answerId, false);
  }

  private async markAnswer(
    postId: number,
    answerId: number,
    correct: boolean,
  ): Promise<boolean> {
    if (correct) {
      await this.db('answers')
        .where('correct', '=', true)
        .where('postId', '=', postId)
        .update({ correct: false });
    }

    const ret = await this.db('answers')
      .where('answers.id', '=', answerId)
      .where('postId', '=', postId)
      .update({ correct }, ['id']);

    if (ret !== undefined && ret?.length > 0) {
      if (correct) {
        await this.db('posts')
          .where('id', '=', postId)
          .increment('correctAnswers', 1);
      } else {
        await this.db('posts')
          .where('id', '=', postId)
          .decrement('correctAnswers', 1);
      }
    }

    return ret !== undefined && ret?.length > 0;
  }

  private getAnswerBaseQuery() {
    return this.db<RawAnswerEntity>('answers').select('*');
  }

  private async mapAnswerEntities(
    rows: RawAnswerEntity[],
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<Answer[]> {
    if (rows.length === 0) {
      return [];
    }
    const answerIds = rows.map(r => r.id);
    const {
      includeVotes = true,
      includeComments = true,
      includePost = true,
      includeExperts = true,
    } = options ?? {};
    const [votes, comments, posts, attachments, experts] = await Promise.all([
      includeVotes
        ? this.db<RawAnswerVoteEntity>('answer_votes')
            .whereIn('answerId', answerIds)
            .select()
        : undefined,
      includeComments
        ? (this.commentsStore.getAnswerComments(
            answerIds as any,
            options?.commentsFilter,
          ) as unknown as Promise<(QetaComment & { answerId: number })[]>)
        : undefined,
      includePost && this.postsStore
        ? this.postsStore
            .getPosts(user_ref, {
              ids: [...new Set(rows.map((r: RawAnswerEntity) => r.postId))],
              limit: rows.length,
            })
            .then(p => p.posts)
        : undefined,
      this.attachmentsStore.getAttachments(answerIds, 'answerId'),
      includeExperts
        ? this.db('tag_experts')
            .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
            .leftJoin('post_tags', 'post_tags.tagId', 'tags.id')
            .leftJoin('answers', 'answers.postId', 'post_tags.postId')
            .whereIn('answers.id', answerIds)
            .select('answers.id as answerId', 'tag_experts.entityRef')
        : undefined,
    ]);

    const votesMap = new Map<number, RawAnswerVoteEntity[]>();
    votes?.forEach((v: RawAnswerVoteEntity) => {
      const ps = votesMap.get(v.answerId) || [];
      ps.push(v);
      votesMap.set(v.answerId, ps);
    });

    const commentsMap = new Map<number, QetaComment[]>();
    comments?.forEach(c => {
      const ps = commentsMap.get(c.answerId) || [];
      ps.push(c);
      commentsMap.set(c.answerId, ps);
    });

    const attachmentsMap = attachments ?? new Map<number, number[]>();

    const expertsMap = new Map<number, string[]>();
    experts?.forEach((e: any) => {
      const ps = expertsMap.get(e.answerId) || [];
      ps.push(e.entityRef);
      expertsMap.set(e.answerId, ps);
    });

    return rows.map(val => {
      const answerVotes = votesMap.get(val.id) || [];
      return {
        id: val.id,
        postId: val.postId,
        own: val.author === user_ref,
        author:
          val.anonymous && val.author !== user_ref ? 'anonymous' : val.author,
        content: val.content,
        correct: val.correct,
        created: val.created,
        updated: val.updated,
        updatedBy: val.updatedBy,
        status: val.status as AnswerCommentStatus,
        score: this.mapToInteger(val.score),
        votes: answerVotes.map((v: RawAnswerVoteEntity) => ({
          author: v.author,
          score: v.score,
          timestamp: v.timestamp,
        })),
        comments: commentsMap.get(val.id),
        anonymous: val.anonymous,
        post: posts?.find(p => p?.id === val.postId) ?? undefined,
        images: attachmentsMap.get(val.id) || [],
        experts: expertsMap.get(val.id),
      };
    });
  }

  async backfillLinks() {
    const route = this.config?.getOptionalString('qeta.route') ?? 'qeta';
    const answers = await this.db('answers')
      .select('id', 'postId', 'content')
      .where('content', 'like', `%/${route}/%`);
    for (const answer of answers) {
      const links = Array.from(extractPostIds(answer.content, this.config));
      await this.updateAnswerLinks(answer.postId, links, answer.id);
    }
  }

  async updateAnswerLinks(
    postId: number,
    links: Array<{ id: number; type: string }>,
    answerId: number,
  ) {
    if (links.length > 0) {
      const existingKeyValues = await this.db('posts')
        .whereIn(
          'id',
          links.map(i => i.id),
        )
        .select('id', 'type');

      const existingIds = new Set(
        existingKeyValues
          .filter(e => {
            const match = links.find(i => i.id === e.id);
            return match && match.type === e.type;
          })
          .map(e => e.id),
      );

      existingIds.delete(postId);

      await this.db('post_links').where('viaAnswerId', answerId).delete();

      if (existingIds.size > 0) {
        const inserts = Array.from(existingIds).map(linkedPostId => ({
          postId,
          linkedPostId,
          viaAnswerId: answerId,
        }));
        await this.db('post_links')
          .insert(inserts)
          .onConflict(['postId', 'linkedPostId'])
          .ignore();
      }
    } else {
      await this.db('post_links').where('viaAnswerId', answerId).delete();
    }
  }
}
