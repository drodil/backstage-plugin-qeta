import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Knex } from 'knex';
import {
  Answers,
  AnswersOptions,
  AttachmentParameters,
  CollectionOptions,
  Collections,
  EntityResponse,
  MaybeAnswer,
  MaybeCollection,
  MaybeComment,
  MaybePost,
  PostOptions,
  Posts,
  QetaStore,
  TagResponse,
} from './QetaStore';
import {
  Answer,
  Attachment,
  Collection,
  Comment,
  filterTags,
  GlobalStat,
  Post,
  PostType,
  Statistic,
  StatisticsRequestParameters,
  UserEntitiesResponse,
  UserStat,
  UserTagsResponse,
  Vote,
} from '@drodil/backstage-plugin-qeta-common';
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { QetaFilter, QetaFilters } from '../service/util';
import {
  isAndCriteria,
  isNotCriteria,
  isOrCriteria,
} from '@backstage/plugin-permission-node';
import { compact } from 'lodash';

const migrationsDir = resolvePackagePath(
  '@drodil/backstage-plugin-qeta-backend',
  'migrations',
);

export type RawPostEntity = {
  id: number;
  author: string;
  title: string;
  content: string;
  created: Date | string;
  updated: Date | string;
  updatedBy: string;
  score: number | string;
  views: number | string;
  answersCount: number | string;
  correctAnswers: number | string;
  favorite: number | string;
  trend: number | string;
  anonymous: boolean;
  type: 'question';
  headerImage: string;
};

export type RawCollectionEntity = {
  id: number;
  title: string;
  description: string;
  created: Date;
  owner: string;
  readAccess: string;
  editAccess: string;
  headerImage: string;
};

export type RawAnswerEntity = {
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
};

export type RawPostVoteEntity = {
  postId: number;
  author: string;
  score: number;
  timestamp: Date;
};

export type RawAnswerVoteEntity = {
  answerId: number;
  author: string;
  score: number;
  timestamp: Date;
};

export type RawTagEntity = {
  id: number;
  tag: string;
};

export type RawCommentEntity = {
  id: number;
  author: string;
  content: string;
  created: Date;
  updated: Date;
  updatedBy: string;
};

export type RawUserImpact = {
  userRef: string;
  impact: number;
  date: Date;
};

function isQetaFilter(filter: any): filter is QetaFilter {
  return filter.hasOwnProperty('property');
}

function parseFilter(
  filter: PermissionCriteria<QetaFilters>,
  query: Knex.QueryBuilder,
  db: Knex,
  isPost: boolean = true,
  negate: boolean = false,
): Knex.QueryBuilder {
  if (isNotCriteria(filter)) {
    return parseFilter(filter.not, query, db, isPost, !negate);
  }

  if (isQetaFilter(filter)) {
    const values: string[] = compact(filter.values) ?? [];

    if (filter.property === 'tags') {
      const postIds = db('tags')
        .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
        .where('tags.tag', 'in', values)
        .select('post_tags.postId');
      query.whereIn(isPost ? 'posts.id' : 'answers.postId', postIds);
      return query;
    }

    if (filter.property === 'entityRefs') {
      const postIds = db('entities')
        .leftJoin('post_entities', 'entities.id', 'post_entities.entityId')
        .where('entities.entity_ref', 'in', values)
        .select('post_entities.postId');
      query.whereIn(isPost ? 'posts.id' : 'answers.postId', postIds);
      return query;
    }

    if (values.length === 0) {
      return query.whereNull(filter.property);
    }

    return query.whereIn(filter.property, values);
  }

  return query[negate ? 'andWhereNot' : 'andWhere'](function filterFunction() {
    if (isOrCriteria(filter)) {
      for (const subFilter of filter.anyOf ?? []) {
        this.orWhere(subQuery =>
          parseFilter(subFilter, subQuery, db, isPost, false),
        );
      }
    } else if (isAndCriteria(filter)) {
      for (const subFilter of filter.allOf ?? []) {
        this.andWhere(subQuery =>
          parseFilter(subFilter, subQuery, db, isPost, false),
        );
      }
    }
  });
}

export class DatabaseQetaStore implements QetaStore {
  private constructor(private readonly db: Knex) {}

  static async create({
    database,
    skipMigrations,
  }: {
    database: DatabaseService;
    skipMigrations?: boolean;
  }): Promise<DatabaseQetaStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      // prettier-ignore
      await client.migrate.latest({ // nosonar
        directory: migrationsDir,
      });
    }

    return new DatabaseQetaStore(client);
  }

  async getPosts(
    user_ref: string,
    options: PostOptions,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Posts> {
    const query = this.getPostsBaseQuery(user_ref);
    if (options.type) {
      query.where('type', options.type);
    }

    if (options.fromDate && options.toDate) {
      query.whereBetween('posts.created', [
        `${options.fromDate} 00:00:00.000+00`,
        `${options.toDate} 23:59:59.999+00`,
      ]);
    }

    if (options.author) {
      if (Array.isArray(options.author)) {
        query.whereIn('posts.author', options.author);
      } else {
        query.where('posts.author', '=', options.author);
      }
    }

    if (filters) {
      parseFilter(filters, query, this.db);
    }

    if (options.searchQuery) {
      if (this.db.client.config.client === 'pg') {
        query.whereRaw(
          `(to_tsvector('english', posts.title || ' ' || posts.content) @@ websearch_to_tsquery('english', quote_literal(?))
          or to_tsvector('english', posts.title || ' ' || posts.content) @@ to_tsquery('english',quote_literal(?)))`,
          [
            `${options.searchQuery}`,
            `${options.searchQuery.replaceAll(/\s/g, '+')}:*`,
          ],
        );
      } else {
        query.whereRaw(
          `LOWER(posts.title || ' ' || posts.content) LIKE LOWER(?)`,
          [`%${options.searchQuery}%`],
        );
      }
    }

    const tags = filterTags(options.tags);
    if (tags) {
      tags.forEach((t, i) => {
        query.innerJoin(`post_tags AS qt${i}`, 'posts.id', `qt${i}.postId`);
        query.innerJoin(`tags AS t${i}`, `qt${i}.tagId`, `t${i}.id`);
        query.where(`t${i}.tag`, '=', t);
      });
    }

    if (options.entity) {
      query.leftJoin('post_entities', 'posts.id', 'post_entities.postId');
      query.leftJoin('entities', 'post_entities.entityId', 'entities.id');
      query.where('entities.entity_ref', '=', options.entity);
    }

    if (options.collectionId) {
      console.log(options.collectionId);
      query.leftJoin('collection_posts', 'posts.id', 'collection_posts.postId');
      query.where('collection_posts.collectionId', options.collectionId);
    }

    if (options.noAnswers) {
      query.whereNull('answers.postId');
    }

    if (options.noCorrectAnswer) {
      query.leftJoin('answers as correct_answer', builder => {
        builder
          .on('posts.id', 'correct_answer.postId')
          .on('correct_answer.correct', this.db.raw('?', [true]));
      });
      query.whereNull('correct_answer.postId');
    }

    if (options.noVotes) {
      query.whereNull('post_votes.postId');
    }

    if (options.favorite) {
      query.where('user_favorite.user', '=', user_ref);
      query.whereNotNull('user_favorite.postId');
    }

    if (options.includeTrend) {
      query.select(
        this.db.raw(
          '((EXTRACT(EPOCH FROM posts.created) / EXTRACT(EPOCH FROM now())) * (SELECT coalesce(NULLIF(COUNT(*),0), 1) FROM post_views WHERE ?? = ??) * (SELECT coalesce(NULLIF(COUNT(*),0), 1) FROM answers WHERE ?? = ??) * (SELECT coalesce(NULLIF(SUM(score),0), 1) FROM post_votes WHERE ?? = ??)) as trend',
          ['postId', 'posts.id', 'postId', 'posts.id', 'postId', 'posts.id'],
        ),
      );
    }

    const totalQuery = query.clone();

    if (options.random) {
      query.orderByRaw('RANDOM()');
    } else if (options.orderBy) {
      query.orderBy(options.orderBy, options.order ? options.order : 'desc');
    } else {
      query.orderBy('created', 'desc');
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
    const rows = results[0] as RawPostEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      posts: await Promise.all(
        rows.map(async val => {
          return this.mapPostEntity(
            val,
            user_ref,
            options.includeAnswers,
            options.includeVotes,
            options.includeEntities,
          );
        }),
      ),
      total,
    };
  }

  async getPost(
    user_ref: string,
    id: number,
    recordView?: boolean,
  ): Promise<MaybePost> {
    const rows = await this.getPostsBaseQuery(user_ref).where(
      'posts.id',
      '=',
      id,
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    if (recordView === undefined || recordView) {
      this.recordPostView(id, user_ref);
    }
    return await this.mapPostEntity(
      rows[0] as unknown as RawPostEntity,
      user_ref,
      true,
      true,
      true,
      true,
    );
  }

  async getPostByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
  ): Promise<MaybePost> {
    const rows = await this.getPostsBaseQuery(user_ref)
      .where('answers.id', '=', answerId)
      .select('posts.*');
    if (!rows || rows.length === 0) {
      return null;
    }
    if (recordView === undefined || recordView) {
      this.recordPostView(rows[0].id, user_ref);
    }
    return await this.mapPostEntity(
      rows[0] as unknown as RawPostEntity,
      user_ref,
      true,
      true,
      true,
    );
  }

  async createPost(options: {
    user_ref: string;
    title: string;
    content: string;
    created: Date;
    tags?: string[];
    entities?: string[];
    images?: number[];
    anonymous?: boolean;
    type?: PostType;
    headerImage?: string;
  }): Promise<Post> {
    const {
      user_ref,
      title,
      content,
      created,
      tags,
      entities,
      images,
      anonymous,
      type = 'question',
      headerImage,
    } = options;
    const posts = await this.db
      .insert(
        {
          author: user_ref,
          title,
          content,
          created,
          anonymous: anonymous ?? false,
          type: type ?? 'question',
          headerImage,
        },
        ['id'],
      )
      .into('posts')
      .returning([
        'id',
        'author',
        'title',
        'content',
        'created',
        'anonymous',
        'type',
      ]);

    await Promise.all([
      this.addPostTags(posts[0].id, tags),
      this.addPostEntities(posts[0].id, entities),
    ]);

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ postId: posts[0].id });
    }

    return this.mapPostEntity(posts[0], user_ref, false, false, true);
  }

  async commentPost(
    post_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybePost> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        postId: post_id,
      })
      .into('post_comments');

    return await this.getPost(user_ref, post_id, false);
  }

  async deletePostComment(
    post_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybePost> {
    const query = this.db('post_comments')
      .where('id', '=', id)
      .where('postId', '=', post_id);
    await query.delete();
    return this.getPost(user_ref, post_id, false);
  }

  async commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeAnswer> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        answerId: answer_id,
      })
      .into('answer_comments');
    return this.getAnswer(answer_id, user_ref);
  }

  async deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybeAnswer> {
    const query = this.db('answer_comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);
    await query.delete();
    return this.getAnswer(answer_id, user_ref);
  }

  async updatePost(options: {
    id: number;
    user_ref: string;
    title: string;
    content: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    headerImage?: string;
  }): Promise<MaybePost> {
    const {
      id,
      user_ref,
      title,
      content,
      tags,
      entities,
      images,
      headerImage,
    } = options;
    const query = this.db('posts').where('posts.id', '=', id);
    const rows = await query.update({
      title,
      content,
      headerImage,
      updatedBy: user_ref,
      updated: new Date(),
    });

    if (!rows) {
      return null;
    }

    await Promise.all([
      this.addPostTags(id, tags, true),
      this.addPostEntities(id, entities, true),
    ]);

    if (images && images.length > 0) {
      await this.db('attachments').whereIn('id', images).update({ postId: id });
    }

    return await this.getPost(user_ref, id, false);
  }

  async deletePost(id: number): Promise<boolean> {
    const query = this.db('posts').where('id', '=', id);
    return !!(await query.delete());
  }

  async answerPost(
    user_ref: string,
    postId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
  ): Promise<MaybeAnswer> {
    const answers = await this.db
      .insert({
        postId,
        author: user_ref,
        content: answer,
        correct: false,
        created,
        anonymous: anonymous ?? false,
      })
      .into('answers')
      .returning('id');

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ answerId: answers[0].id });
    }

    return this.getAnswer(answers[0].id, user_ref);
  }

  async updateAnswer(
    user_ref: string,
    postId: number,
    answerId: number,
    answer: string,
    images?: number[],
  ): Promise<MaybeAnswer> {
    const query = this.db('answers')
      .where('answers.id', '=', answerId)
      .where('answers.postId', '=', postId);

    const rows = await query.update({
      content: answer,
      updatedBy: user_ref,
      updated: new Date(),
    });

    if (!rows) {
      return null;
    }

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ answerId: answerId });
    }

    return this.getAnswer(answerId, user_ref);
  }

  async getAnswers(
    user_ref: string,
    options: AnswersOptions,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Answers> {
    const query = this.getAnswerBaseQuery();
    if (options.fromDate && options.toDate) {
      query.whereBetween('answers.created', [
        `${options.fromDate} 00:00:00.000+00`,
        `${options.toDate} 23:59:59.999+00`,
      ]);
    }

    if (options.author) {
      query.where('answers.author', '=', options.author);
    }

    if (filters) {
      parseFilter(filters, query, this.db, false);
    }

    const tags = filterTags(options.tags);
    if (tags) {
      tags.forEach((t, i) => {
        query.innerJoin(
          `post_tags AS at${i}`,
          'answers.postId',
          `at${i}.postId`,
        );
        query.innerJoin(`tags AS t${i}`, `at${i}.tagId`, `t${i}.id`);
        query.where(`t${i}.tag`, '=', t);
      });
    }

    if (options.entity) {
      query.leftJoin('post_entities', 'answers.postId', 'post_entities.postId');
      query.leftJoin('entities', 'post_entities.entityId', 'entities.id');
      query.where('entities.entity_ref', '=', options.entity);
    }

    if (options.noCorrectAnswer) {
      query.where('correct', '=', false);
    }

    if (options.noVotes) {
      query.whereNull('answer_votes.answerId');
    }

    if (options.searchQuery) {
      if (this.db.client.config.client === 'pg') {
        query.whereRaw(
          `(to_tsvector('english', answers.content) @@ websearch_to_tsquery('english', quote_literal(?))
          or to_tsvector('english', answers.content) @@ to_tsquery('english',quote_literal(?)))`,
          [
            `${options.searchQuery}`,
            `${options.searchQuery.replaceAll(/\s/g, '+')}:*`,
          ],
        );
      } else {
        query.whereRaw(`LOWER(answers.content) LIKE LOWER(?)`, [
          `%${options.searchQuery}%`,
        ]);
      }
    }

    const totalQuery = query.clone();

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order ? options.order : 'desc');
    } else {
      query.orderBy('created', 'desc');
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
      answers: await Promise.all(
        rows.map(async val => {
          return this.mapAnswer(val, user_ref, true, true, true);
        }),
      ),
      total,
    };
  }

  async getAnswer(answerId: number, user_ref: string): Promise<MaybeAnswer> {
    const answers = await this.getAnswerBaseQuery().where('id', '=', answerId);
    return this.mapAnswer(answers[0], user_ref, true, true);
  }

  async getPostComment(commentId: number): Promise<MaybeComment> {
    const comments = await this.db<RawCommentEntity>('post_comments') // nosonar
      .where('post_comments.id', '=', commentId)
      .select();
    if (comments.length === 0) {
      return null;
    }
    return await this.mapComment(comments[0]);
  }

  async getAnswerComment(commentId: number): Promise<MaybeComment> {
    const comments = await this.db<RawCommentEntity>('answer_comments') // nosonar
      .where('answer_comments.id', '=', commentId)
      .select();
    if (comments.length === 0) {
      return null;
    }
    return await this.mapComment(comments[0]);
  }

  async deleteAnswer(id: number): Promise<boolean> {
    const query = this.db('answers').where('id', '=', id);
    return !!(await query.delete());
  }

  async votePost(
    user_ref: string,
    postId: number,
    score: number,
  ): Promise<boolean> {
    await this.db('post_votes')
      .where('author', '=', user_ref)
      .where('postId', '=', postId)
      .delete();

    const id = await this.db
      .insert(
        {
          author: user_ref,
          postId,
          score,
          timestamp: new Date(),
        },
        ['postId'],
      )
      .onConflict()
      .ignore()
      .into('post_votes');
    return id && id.length > 0;
  }

  async favoritePost(user_ref: string, postId: number): Promise<boolean> {
    const id = await this.db
      .insert(
        {
          user: user_ref,
          postId,
        },
        ['postId'],
      )
      .onConflict()
      .ignore()
      .into('user_favorite');
    return id && id.length > 0;
  }

  async unfavoritePost(user_ref: string, postId: number): Promise<boolean> {
    return !!(await this.db('user_favorite')
      .where('user', '=', user_ref)
      .where('postId', '=', postId)
      .delete());
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

    const id = await this.db
      .insert(
        {
          author: user_ref,
          answerId,
          score,
          timestamp: new Date(),
        },
        ['answerId'],
      )
      .onConflict()
      .ignore()
      .into('answer_votes');
    return id && id.length > 0;
  }

  async markAnswerCorrect(postId: number, answerId: number): Promise<boolean> {
    return await this.markAnswer(postId, answerId, true);
  }

  async markAnswerIncorrect(
    postId: number,
    answerId: number,
  ): Promise<boolean> {
    return await this.markAnswer(postId, answerId, false);
  }

  async getTags(): Promise<TagResponse[]> {
    const tagRef = this.db.ref('tags.id');
    const postsCount = this.db('post_tags')
      .where('post_tags.tagId', tagRef)
      .count('*')
      .as('postsCount');

    const tags = await this.db('tags')
      .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
      .orderBy('postsCount', 'desc')
      .select('tag', postsCount)
      .groupBy('tags.id');

    return tags.map(tag => {
      return {
        tag: tag.tag,
        postsCount: this.mapToInteger(tag.postsCount),
      };
    });
  }

  async getUserTags(user_ref: string): Promise<UserTagsResponse> {
    const tags = await this.db('user_tags')
      .where('userRef', user_ref)
      .leftJoin('tags', 'user_tags.tagId', 'tags.id')
      .select('tags.tag');

    return {
      tags: tags.map(tag => tag.tag),
      count: tags.length,
    };
  }

  async getUsersForTags(tags?: string[]): Promise<string[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    const users = await this.db('user_tags')
      .leftJoin('tags', 'user_tags.tagId', 'tags.id')
      .whereIn('tags.tag', tags)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async followTag(user_ref: string, tag: string): Promise<boolean> {
    const tagId = await this.db('tags').where('tag', tag).select('id').first();
    if (!tagId) {
      return false;
    }
    await this.db
      .insert(
        {
          userRef: user_ref,
          tagId: tagId.id,
        },
        ['tagId'],
      )
      .into('user_tags');
    return true;
  }

  async unfollowTag(user_ref: string, tag: string): Promise<boolean> {
    const tagId = await this.db('tags').where('tag', tag).select('id').first();
    if (!tagId) {
      return false;
    }
    await this.db('user_tags')
      .where('userRef', user_ref)
      .where('tagId', tagId.id)
      .delete();
    return true;
  }

  async getEntities(): Promise<EntityResponse[]> {
    const entityRef = this.db.ref('entities.id');
    const postsCount = this.db('post_entities')
      .where('post_entities.entityId', entityRef)
      .count('*')
      .as('postsCount');

    const entities = await this.db('entities')
      .leftJoin('post_entities', 'entities.id', 'post_entities.entityId')
      .orderBy('postsCount', 'desc')
      .select('entity_ref', postsCount)
      .groupBy('entities.id');

    return entities.map(entity => {
      return {
        entityRef: entity.entity_ref,
        postsCount: this.mapToInteger(entity.postsCount),
      };
    });
  }

  async getUserEntities(user_ref: string): Promise<UserEntitiesResponse> {
    const entities = await this.db('user_entities')
      .where('userRef', user_ref)
      .select('entityRef');

    return {
      entityRefs: entities.map(e => e.entityRef),
      count: entities.length,
    };
  }

  async getUsersForEntities(entityRefs?: string[]): Promise<string[]> {
    if (!entityRefs || entityRefs.length === 0) {
      return [];
    }

    const users = await this.db('user_entities')
      .whereIn('entityRef', entityRefs)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async followEntity(user_ref: string, entityRef: string): Promise<boolean> {
    await this.db
      .insert({
        userRef: user_ref,
        entityRef: entityRef,
      })
      .into('user_entities');
    return true;
  }

  async unfollowEntity(user_ref: string, entityRef: string): Promise<boolean> {
    await this.db('user_entities')
      .where('userRef', user_ref)
      .where('entityRef', entityRef)
      .delete();
    return true;
  }

  async getMostUpvotedPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('posts as q')
      .sum('qv.score as total')
      .select('q.author')
      .join('post_votes as qv', 'q.id', 'qv.postId')
      .groupBy('q.author')
      .orderBy('total', 'desc')
      .where('anonymous', '!=', true);

    if (author) {
      query.where('q.author', '=', author);
    }

    if (options?.period) {
      query.where('q.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    // This can probably be replaced to use
    // DENSE_RANK() over (total) directly by the  query
    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getTotalPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('posts as q')
      .count('q.id as total')
      .select('q.author')
      .groupBy('author')
      .orderBy('total', 'desc')
      .where('q.anonymous', '!=', true);

    if (author) {
      query.where('q.author', '=', author);
    }

    if (options?.period) {
      query.where('q.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];
    if (!author) {
      rows.map((row, index) => {
        row.position = index + 1;
      });
    }

    return rows;
  }

  async getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .sum('av.score as total')
      .select('a.author')
      .join('answer_votes as av', 'a.id', 'av.answerId')
      .groupBy('a.author')
      .orderBy('total', 'desc')
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .sum('av.score as total')
      .select('a.author')
      .join('answer_votes as av', 'a.id', 'av.answerId')
      .groupBy('a.author')
      .orderBy('total', 'desc')
      .where('a.correct', '=', true)
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    rows.map((row, index) => {
      row.position = index + 1;
    });

    return rows;
  }

  async getTotalAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    const query = this.db<Statistic>('answers as a')
      .count('a.id as total')
      .select('a.author')
      .groupBy('author')
      .orderBy('total', 'desc')
      .where('a.anonymous', '!=', true);

    if (author) {
      query.where('a.author', '=', author);
    }

    if (options?.period) {
      query.where('a.created', '>', options.period);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }

    const rows = (await query) as unknown as Statistic[];

    if (!author) {
      rows.map((row, index) => {
        row.position = index + 1;
      });
    }

    return rows;
  }

  async postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment> {
    const attachments: Attachment[] = await this.db
      .insert(
        {
          uuid: uuid,
          locationType: locationType,
          locationUri: locationUri,
          extension: extension,
          mimeType: mimeType,
          path: path,
          binaryImage: binaryImage,
          creator: creator,
          created: new Date(),
        },
        ['id', 'uuid', 'locationUri', 'locationType'],
      )
      .into('attachments');

    return attachments[0];
  }

  async getAttachment(uuid: string): Promise<Attachment | undefined> {
    return this.db<Attachment>('attachments').where('uuid', '=', uuid).first();
  }

  async getUsers(): Promise<string[]> {
    const postUsers = await this.db('posts').select('author');
    const answerUsers = await this.db('answers').select('author');
    const allUsers = [...postUsers, answerUsers]
      .map(user => user.author)
      .filter(Boolean);
    return [...new Set(allUsers)];
  }

  async getTotalViews(user_ref: string, lastDays?: number): Promise<number> {
    const now = new Date();
    if (lastDays) {
      now.setDate(now.getDate() - lastDays);
    }

    const postViewsQuery = this.db('post_views')
      .innerJoin('posts', 'post_views.postId', 'posts.id')
      .where('posts.author', user_ref);
    if (lastDays) {
      postViewsQuery.where('posts.created', '>', now);
    }

    const answerViewsQuery = this.db('post_views')
      .innerJoin('answers', 'post_views.postId', 'answers.postId')
      .innerJoin('posts', 'post_views.postId', 'posts.id')
      .where('answers.author', user_ref)
      .whereNot('posts.author', user_ref);
    if (lastDays) {
      answerViewsQuery.where('answers.created', '>', now);
    }

    const postViews = await postViewsQuery.count('* as total');
    const answerViews = await answerViewsQuery.count('* as total');

    return Number(postViews[0].total) + Number(answerViews[0].total);
  }

  async saveUserStats(user_ref: string, date: Date): Promise<void> {
    await this.db('user_stats')
      .insert({
        userRef: user_ref,
        totalQuestions: await this.getCount('posts', {
          author: user_ref,
          type: 'question',
        }),
        totalAnswers: await this.getCount('answers', { author: user_ref }),
        totalViews: await this.getTotalViews(user_ref),
        totalComments:
          (await this.getCount('post_comments', { author: user_ref })) +
          (await this.getCount('answer_comments', { author: user_ref })),
        totalVotes:
          (await this.getCount('post_votes', { author: user_ref })) +
          (await this.getCount('answer_votes', { author: user_ref })),
        totalArticles: await this.getCount('posts', {
          author: user_ref,
          type: 'article',
        }),
        date,
      })
      .onConflict(['userRef', 'date'])
      .merge();
  }

  async saveGlobalStats(date: Date): Promise<void> {
    await this.db('global_stats')
      .insert({
        totalQuestions: await this.getCount('posts', { type: 'question' }),
        totalAnswers: await this.getCount('answers'),
        totalUsers: (await this.getUsers()).length,
        totalTags: await this.getCount('tags'),
        totalViews: await this.getCount('post_views'),
        totalComments:
          (await this.getCount('post_comments')) +
          (await this.getCount('answer_comments')),
        totalVotes:
          (await this.getCount('post_votes')) +
          (await this.getCount('answer_votes')),
        totalArticles: await this.getCount('posts', { type: 'article' }),
        date,
      })
      .onConflict(['date'])
      .merge();
  }

  async getGlobalStats(): Promise<GlobalStat[]> {
    return this.db('global_stats').select('*').orderBy('date', 'desc');
  }

  async getUserStats(user_ref: string): Promise<UserStat[]> {
    return this.db('user_stats')
      .where('userRef', user_ref)
      .select('*')
      .orderBy('date', 'desc');
  }

  async cleanStats(days: number, date: Date): Promise<void> {
    const now = new Date(date);
    now.setDate(now.getDate() - days);
    await this.db('user_stats').where('date', '<=', now).delete();
    await this.db('global_stats').where('date', '<=', now).delete();
  }

  async getCount(
    table: string,
    filters?: { author?: string; type?: PostType },
  ): Promise<number> {
    const query = this.db(table);
    if (filters?.author) {
      query.where('author', filters.author);
    }
    if (filters?.type) {
      query.where('type', filters.type);
    }
    const result = await query.count('* as total').first();
    return this.mapToInteger(result?.total);
  }

  async getCollections(
    user_ref: string,
    options: CollectionOptions,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Collections> {
    const query = this.db('collections');
    if (options.owner) {
      query.where('owner', options.owner);
    }

    if (options.searchQuery) {
      if (this.db.client.config.client === 'pg') {
        query.whereRaw(
          `(to_tsvector('english', collections.title || ' ' || collections.description) @@ websearch_to_tsquery('english', quote_literal(?))
          or to_tsvector('english', collections.title || ' ' || collections.description) @@ to_tsquery('english',quote_literal(?)))`,
          [
            `${options.searchQuery}`,
            `${options.searchQuery.replaceAll(/\s/g, '+')}:*`,
          ],
        );
      } else {
        query.whereRaw(
          `LOWER(collections.title || ' ' || collections.content) LIKE LOWER(?)`,
          [`%${options.searchQuery}%`],
        );
      }
    }

    query.where('owner', user_ref).orWhere('readAccess', 'public');
    const totalQuery = query.clone();

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order || 'desc');
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
    const rows = results[0] as RawCollectionEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);
    return {
      collections: await Promise.all(
        rows.map(async val => {
          return this.mapCollectionEntity(val, user_ref, filters);
        }),
      ),
      total,
    };
  }

  async getCollection(
    user_ref: string,
    id: number,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<MaybeCollection> {
    const collections = await this.db('collections').where('id', '=', id);
    if (collections.length === 0) {
      return null;
    }
    return this.mapCollectionEntity(collections[0], user_ref, filters);
  }

  async createCollection(options: {
    user_ref: string;
    title: string;
    description?: string;
    created: Date;
    readAccess: string;
    editAccess: string;
    images?: number[];
    headerImage?: string;
  }): Promise<Collection> {
    const {
      user_ref,
      title,
      readAccess,
      editAccess,
      description,
      created,
      images,
      headerImage,
    } = options;
    const collections = await this.db
      .insert(
        {
          owner: user_ref,
          title,
          description,
          created,
          readAccess,
          editAccess,
          headerImage,
        },
        ['id'],
      )
      .into('collections')
      .returning([
        'id',
        'title',
        'description',
        'created',
        'readAccess',
        'editAccess',
        'headerImage',
      ]);

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ collectionId: collections[0].id });
    }

    return this.mapCollectionEntity(collections[0], user_ref);
  }

  async updateCollection(options: {
    id: number;
    user_ref: string;
    title: string;
    description?: string;
    readAccess?: string;
    editAccess?: string;
    images?: number[];
    headerImage?: string;
  }): Promise<MaybeCollection> {
    const {
      id,
      user_ref,
      title,
      readAccess,
      editAccess,
      description,
      images,
      headerImage,
    } = options;
    const query = this.db('collections').where('collections.id', '=', id);
    const rows = await query.update({
      title,
      description,
      headerImage,
      readAccess,
      editAccess,
    });

    if (!rows) {
      return null;
    }

    if (images && images.length > 0) {
      await this.db('attachments')
        .whereIn('id', images)
        .update({ collectionId: id });
    }

    return await this.getCollection(user_ref, id);
  }

  async deleteCollection(id: number): Promise<boolean> {
    const query = this.db('collections').where('id', '=', id);
    return !!(await query.delete());
  }

  async addPostToCollection(
    user_ref: string,
    id: number,
    postId: number,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<MaybeCollection> {
    await this.db
      .insert({
        collectionId: id,
        postId,
      })
      .into('collection_posts')
      .onConflict()
      .ignore();
    return await this.getCollection(user_ref, id, filters);
  }

  async removePostFromCollection(
    user_ref: string,
    id: number,
    postId: number,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<MaybeCollection> {
    await this.db('collection_posts')
      .where('collectionId', id)
      .where('postId', postId)
      .delete();
    return await this.getCollection(user_ref, id, filters);
  }

  /**
   * Maps string or number value to integer. This is due to fact that postgres returns
   * strings instead numbers for count and sum functions.
   * @param val
   */
  private mapToInteger = (val: string | number | undefined): number => {
    return typeof val === 'string' ? Number.parseInt(val, 10) : val ?? 0;
  };

  private async mapCollectionEntity(
    val: RawCollectionEntity,
    user_ref: string,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Collection> {
    const collections = await this.getPosts(
      user_ref,
      { collectionId: val.id },
      filters,
    );
    const canEdit = val.owner === user_ref || val.editAccess === 'public';
    const canDelete = val.owner === user_ref;

    const entities = compact([
      ...new Set(collections.posts.map(p => p.entities).flat()),
    ]);
    const tags = compact([
      ...new Set(collections.posts.map(p => p.tags).flat()),
    ]);

    return {
      id: val.id,
      title: val.title,
      owner: val.owner,
      description: val.description,
      created: val.created as Date,
      posts: collections.posts,
      readAccess: val.readAccess as 'public' | 'private',
      editAccess: val.editAccess as 'public' | 'private',
      canEdit,
      canDelete,
      headerImage: val.headerImage,
      entities,
      tags,
    };
  }

  private async mapPostEntity(
    val: RawPostEntity,
    user_ref: string,
    addAnswers?: boolean,
    addVotes?: boolean,
    addEntities?: boolean,
    addComments?: boolean,
  ): Promise<Post> {
    // TODO: This could maybe done with join
    const additionalInfo = await Promise.all([
      this.getPostTags(val.id),
      addAnswers
        ? this.getPostAnswers(val.id, user_ref, addVotes, addComments)
        : undefined,
      addVotes !== false ? this.getPostVotes(val.id) : undefined,
      addEntities ? this.getPostEntities(val.id) : undefined,
      addComments ? this.getPostComments(val.id) : undefined,
    ]);
    return {
      id: val.id,
      author:
        val.anonymous && val.author !== user_ref ? 'anonymous' : val.author,
      own: val.author === user_ref,
      title: val.title,
      content: val.content,
      created: val.created as Date,
      updated: val.updated as Date,
      updatedBy: val.updatedBy,
      score: this.mapToInteger(val.score),
      views: this.mapToInteger(val.views),
      answersCount: this.mapToInteger(val.answersCount),
      correctAnswer: this.mapToInteger(val.correctAnswers) > 0,
      favorite: this.mapToInteger(val.favorite) > 0,
      tags: additionalInfo[0],
      answers: additionalInfo[1],
      votes: additionalInfo[2],
      entities: additionalInfo[3],
      trend: this.mapToInteger(val.trend),
      comments: additionalInfo[4],
      ownVote: additionalInfo[2]?.find(v => v.author === user_ref)?.score,
      anonymous: val.anonymous,
      type: val.type,
      headerImage: val.headerImage,
    };
  }

  private async mapComment(val: RawCommentEntity): Promise<Comment> {
    return {
      id: val.id,
      author: val.author,
      content: val.content,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
    };
  }

  private async mapAnswer(
    val: RawAnswerEntity,
    user_ref: string,
    addVotes?: boolean,
    addComments?: boolean,
    addPost?: boolean,
  ): Promise<Answer> {
    const additionalInfo = await Promise.all([
      addVotes ? this.getAnswerVotes(val.id) : undefined,
      addComments ? this.getAnswerComments(val.id) : undefined,
      addPost ? this.getPost(user_ref, val.postId, false) : undefined,
    ]);
    return {
      id: val.id,
      postId: val.postId,
      author:
        val.anonymous && val.author !== user_ref ? 'anonymous' : val.author,
      content: val.content,
      correct: val.correct,
      created: val.created,
      updated: val.updated,
      updatedBy: val.updatedBy,
      score: this.mapToInteger(val.score),
      votes: additionalInfo[0],
      comments: additionalInfo[1],
      anonymous: val.anonymous,
      post: additionalInfo[2] ?? undefined,
    };
  }

  private mapVote(val: RawPostVoteEntity | RawAnswerVoteEntity): Vote {
    return {
      author: val.author,
      score: val.score,
      timestamp: val.timestamp,
    };
  }

  private async getPostTags(postId: number): Promise<string[]> {
    const rows = await this.db<RawTagEntity>('tags') // nosonar
      .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
      .where('post_tags.postId', '=', postId)
      .select();
    return rows.map(val => val.tag);
  }

  private async getPostComments(postId: number): Promise<RawCommentEntity[]> {
    return this.db<RawCommentEntity>('post_comments') // nosonar
      .where('post_comments.postId', '=', postId)
      .select();
  }

  private async getAnswerComments(
    answerId: number,
  ): Promise<RawCommentEntity[]> {
    return this.db<RawCommentEntity>('answer_comments') // nosonar
      .where('answer_comments.answerId', '=', answerId)
      .select();
  }

  private async getPostEntities(postId: number): Promise<string[]> {
    const rows = await this.db<RawTagEntity>('entities') // nosonar
      .leftJoin('post_entities', 'entities.id', 'post_entities.entityId')
      .where('post_entities.postId', '=', postId)
      .select();
    return rows.map(val => val.entity_ref);
  }

  private async getPostVotes(postId: number): Promise<Vote[]> {
    const rows = (await this.db<RawPostVoteEntity>('post_votes')
      .where('postId', '=', postId)
      .select()) as RawPostVoteEntity[];
    return rows.map(val => this.mapVote(val));
  }

  private async getAnswerVotes(answerId: number): Promise<Vote[]> {
    const rows = (await this.db<RawAnswerVoteEntity>('answer_votes')
      .where('answerId', '=', answerId)
      .select()) as RawAnswerVoteEntity[];
    return rows.map(val => this.mapVote(val));
  }

  private getAnswerBaseQuery() {
    const postRef = this.db.ref('answers.id');

    const score = this.db('answer_votes')
      .where('answer_votes.answerId', postRef)
      .sum('score')
      .as('score');

    return this.db<RawAnswerEntity>('answers') // nosonar
      .leftJoin('answer_votes', 'answers.id', 'answer_votes.answerId')
      .select('answers.*', score)
      .groupBy('answers.id');
  }

  private async getPostAnswers(
    postId: number,
    user_ref: string,
    addVotes?: boolean,
    addComments?: boolean,
  ): Promise<Answer[]> {
    const rows = await this.getAnswerBaseQuery()
      .where('postId', '=', postId)
      .orderBy('answers.correct', 'desc')
      .orderBy('answers.created');
    return await Promise.all(
      rows.map(async val => {
        return this.mapAnswer(val, user_ref, addVotes, addComments);
      }),
    );
  }

  private async recordPostView(
    postId: number,
    user_ref: string,
  ): Promise<void> {
    await this.db
      .insert({
        author: user_ref,
        postId,
        timestamp: new Date(),
      })
      .into('post_views');
  }

  private getPostsBaseQuery(user: string) {
    const postRef = this.db.ref('posts.id');

    const score = this.db('post_votes')
      .where('post_votes.postId', postRef)
      .sum('score')
      .as('score');

    const views = this.db('post_views')
      .where('post_views.postId', postRef)
      .count('*')
      .as('views');

    const answersCount = this.db('answers')
      .where('answers.postId', postRef)
      .count('*')
      .as('answersCount');

    const correctAnswers = this.db('answers')
      .where('answers.postId', postRef)
      .where('answers.correct', '=', true)
      .count('*')
      .as('correctAnswers');

    const favorite = this.db('user_favorite')
      .where('user_favorite.user', '=', user)
      .where('user_favorite.postId', postRef)
      .count('*')
      .as('favorite');

    return this.db<RawPostEntity>('posts') // nosonar
      .select('posts.*', score, views, answersCount, correctAnswers, favorite)
      .leftJoin('post_votes', 'posts.id', 'post_votes.postId')
      .leftJoin('post_views', 'posts.id', 'post_views.postId')
      .leftJoin('answers', 'posts.id', 'answers.postId')
      .leftJoin('user_favorite', 'posts.id', 'user_favorite.postId')
      .groupBy('posts.id');
  }

  private async addPostTags(
    postId: number,
    tagsInput?: string[],
    removeOld?: boolean,
  ) {
    const tags = filterTags(tagsInput);
    if (removeOld) {
      await this.db('post_tags').where('postId', '=', postId).delete();
    }

    if (!tags || tags.length === 0) {
      return;
    }
    const existingTags = await this.db('tags')
      .whereIn('tag', tags)
      .returning('id')
      .select();
    const newTags = tags.filter(t => !existingTags.some(e => e.tag === t));
    const tagIds = (
      await Promise.all(
        [...new Set(newTags)].map(
          async tag =>
            await this.db
              .insert({ tag: tag.trim() })
              .into('tags')
              .returning('id')
              .onConflict('tag')
              .ignore(),
        ),
      )
    )
      .flat()
      .map(tag => tag.id)
      .concat(existingTags.map(t => t.id));

    await Promise.all(
      tagIds.map(async tagId => {
        await this.db
          .insert({ postId, tagId })
          .into('post_tags')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async addPostEntities(
    postId: number,
    entitiesInput?: string[],
    removeOld?: boolean,
  ) {
    if (removeOld) {
      await this.db('post_entities').where('postId', '=', postId).delete();
    }

    const regex = /\w+:\w+\/\w+/g;
    const entities = entitiesInput?.filter(input => input.match(regex));
    if (!entities || entities.length === 0) {
      return;
    }

    const existingEntities = await this.db('entities')
      .whereIn('entity_ref', entities)
      .returning('id')
      .select();
    const newEntities = entities.filter(
      t => !existingEntities.some(e => e.entity_ref === t),
    );
    const entityIds = (
      await Promise.all(
        [...new Set(newEntities)].map(
          async entity =>
            await this.db
              .insert({ entity_ref: entity })
              .into('entities')
              .returning('id')
              .onConflict('entity_ref')
              .ignore(),
        ),
      )
    )
      .flat()
      .map(entity => entity.id)
      .concat(existingEntities.map(c => c.id));

    await Promise.all(
      entityIds.map(async entityId => {
        await this.db
          .insert({ postId, entityId })
          .into('post_entities')
          .onConflict()
          .ignore();
      }),
    );
  }

  private async markAnswer(
    postId: number,
    answerId: number,
    correct: boolean,
  ): Promise<boolean> {
    // There can be only one correct answer
    if (correct) {
      const exists = await this.db('answers')
        .select('id')
        .where('correct', '=', true)
        .where('postId', '=', postId);
      if (exists && exists.length > 0) {
        return false;
      }
    }

    const query = this.db('answers')
      .onConflict()
      .ignore()
      .where('answers.id', '=', answerId)
      .where('postId', '=', postId);

    const ret = await query.update({ correct }, ['id']);
    return ret !== undefined && ret?.length > 0;
  }
}
