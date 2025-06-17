import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Knex } from 'knex';
import {
  AnswerOptions,
  Answers,
  AttachmentParameters,
  CollectionOptions,
  CollectionPostRank,
  Collections,
  EntitiesResponse,
  EntityResponse,
  MaybeAnswer,
  MaybeCollection,
  MaybeComment,
  MaybePost,
  MaybeTemplate,
  PostOptions,
  Posts,
  QetaStore,
  Templates,
  UserResponse,
  UsersResponse,
} from './QetaStore';
import {
  AIResponse,
  Answer,
  AnswersQuery,
  Attachment,
  Collection,
  CollectionsQuery,
  Comment,
  EntitiesQuery,
  filterTags,
  GlobalStat,
  Post,
  PostsQuery,
  PostType,
  Statistic,
  StatisticsRequestParameters,
  TagResponse,
  TagsQuery,
  TagsResponse,
  Template,
  UserCollectionsResponse,
  UserEntitiesResponse,
  UsersQuery,
  UserStat,
  UserTagsResponse,
  UserUsersResponse,
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
import { TAGS } from '../tagDb';
import { TagDatabase } from '@drodil/backstage-plugin-qeta-node';

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
  headerImage: string;
  postsCount: number | string;
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

export type RawTagExpert = {
  tagId: number;
  entityRef: string;
};

export type RawTemplate = {
  id: number;
  title: string;
  description: string;
  questionTitle: string | null;
  questionContent: string | null;
};

export type RawPostAIAnswer = {
  id: number;
  answer: string;
  created: Date;
};

export type RawAttachment = Omit<Attachment, 'created'> & {
  created: Date | string | number;
};

function isQetaFilter(filter: any): filter is QetaFilter {
  return filter.hasOwnProperty('property');
}

function parseFilter(
  filter: PermissionCriteria<QetaFilters>,
  query: Knex.QueryBuilder,
  db: Knex,
  type: 'post' | 'answer' | 'collection' | 'tags' | 'comments' = 'post',
  negate: boolean = false,
): Knex.QueryBuilder {
  if (isNotCriteria(filter)) {
    return parseFilter(filter.not, query, db, type, !negate);
  }

  if (isQetaFilter(filter)) {
    const values: string[] = compact(filter.values) ?? [];

    let fk = 'posts.id';
    if (type === 'answer') {
      fk = 'answers.postId';
    } else if (type === 'collection') {
      fk = 'collection_posts.postId';
    }
    if (filter.property === 'tags') {
      const postIds = db('tags')
        .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
        .where('tags.tag', 'in', values)
        .select('post_tags.postId');
      query.whereIn(fk, postIds);
      return query;
    }
    if (filter.property === 'tag.experts') {
      if (type === 'post') {
        const postIds = db('tags')
          .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
          .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
          .where('tag_experts.entityRef', 'in', values)
          .select('post_tags.postId');
        query.whereIn(fk, postIds);
        return query;
      } else if (type === 'answer') {
        const answerIds = db('answers')
          .leftJoin('posts', 'answers.postId', 'posts.id')
          .leftJoin('post_tags', 'post_tags.postId', 'posts.id')
          .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
          .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
          .where('tag_experts.entityRef', 'in', values)
          .select('answers.id');
        query.whereIn(fk, answerIds);
        return query;
      } else if (type === 'tags') {
        const tagIds = db('tag_experts')
          .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
          .where('tag_experts.entityRef', 'in', values)
          .select('tag_experts.tagId');
        query.whereIn(fk, tagIds);
        return query;
      } else if (type === 'collection') {
        const collectionIds = db('collection_posts')
          .leftJoin('posts', 'collection_posts.postId', 'posts.id')
          .leftJoin('post_tags', 'post_tags.postId', 'posts.id')
          .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
          .leftJoin('tag_experts', 'tag_experts.tagId', 'tags.id')
          .where('tag_experts.entityRef', 'in', values)
          .select('collection_posts.collectionId');
        query.whereIn(fk, collectionIds);
        return query;
      }
    }

    if (filter.property === 'entityRefs') {
      const postIds = db('entities')
        .leftJoin('post_entities', 'entities.id', 'post_entities.entityId')
        .where('entities.entity_ref', 'in', values)
        .select('post_entities.postId');
      query.whereIn(fk, postIds);
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
          parseFilter(subFilter, subQuery, db, type, false),
        );
      }
    } else if (isAndCriteria(filter)) {
      for (const subFilter of filter.allOf ?? []) {
        this.andWhere(subQuery =>
          parseFilter(subFilter, subQuery, db, type, false),
        );
      }
    }
  });
}

export class DatabaseQetaStore implements QetaStore {
  private constructor(
    private readonly db: Knex,
    private readonly tagDatabase?: TagDatabase,
  ) {}

  static async create({
    database,
    skipMigrations,
    tagDatabase,
  }: {
    database: DatabaseService;
    skipMigrations?: boolean;
    tagDatabase?: TagDatabase;
  }): Promise<DatabaseQetaStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      // prettier-ignore
      await client.migrate.latest({ // nosonar
        directory: migrationsDir,
      });
    }

    return new DatabaseQetaStore(client, tagDatabase);
  }

  async getPosts(
    user_ref: string,
    options: PostsQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: PostOptions,
  ): Promise<Posts> {
    const { includeTotal = true } = opts ?? {};
    const query = this.getPostsBaseQuery(user_ref);
    if (options.type) {
      query.where('posts.type', options.type);
    }

    if (options.fromDate && options.toDate) {
      query.whereBetween('posts.created', [
        `${options.fromDate} 00:00:00.000+00`,
        `${options.toDate} 23:59:59.999+00`,
      ]);
    } else if (options.fromDate) {
      query.where('posts.created', '>=', `${options.fromDate} 00:00:00.000+00`);
    } else if (options.toDate) {
      query.where('posts.created', '<=', `${options.toDate} 23:59:59.999+00`);
    }

    if (options.author) {
      if (Array.isArray(options.author)) {
        query.whereIn('posts.author', options.author);
      } else {
        query.where('posts.author', '=', options.author);
      }
    }

    if (options.excludeAuthors) {
      query.whereNotIn('posts.author', options.excludeAuthors);
    }

    if (filters) {
      parseFilter(filters, query, this.db);
    }

    if (options.searchQuery) {
      this.applySearchQuery(
        query,
        ['posts.title', 'posts.content'],
        options.searchQuery,
      );
    }

    if (options.tags) {
      const tags = filterTags(options.tags);
      if (options.tagsRelation === 'or') {
        query.innerJoin('post_tags', 'posts.id', 'post_tags.postId');
        query.innerJoin('tags', 'post_tags.tagId', 'tags.id');
        query.whereIn('tags.tag', tags);
      } else {
        tags.forEach((t, i) => {
          query.innerJoin(`post_tags AS qt${i}`, 'posts.id', `qt${i}.postId`);
          query.innerJoin(`tags AS t${i}`, `qt${i}.tagId`, `t${i}.id`);
          query.where(`t${i}.tag`, '=', t);
        });
      }
    }

    if (options.entities) {
      if (options.entitiesRelation === 'or') {
        query
          .innerJoin('post_entities', 'posts.id', 'post_entities.postId')
          .innerJoin('entities', 'post_entities.entityId', 'entities.id')
          .whereIn('entities.entity_ref', options.entities);
      } else {
        options.entities.forEach((t, i) => {
          query.innerJoin(
            `post_entities AS pe${i}`,
            'posts.id',
            `pe${i}.postId`,
          );
          query.innerJoin(`entities AS e${i}`, `pe${i}.entityId`, `e${i}.id`);
          query.where(`e${i}.entity_ref`, '=', t);
        });
      }
    }

    if (options.collectionId) {
      query.innerJoin(
        'collection_posts',
        'posts.id',
        'collection_posts.postId',
      );
      query.where('collection_posts.collectionId', options.collectionId);
    } else if (options.orderBy === 'rank') {
      query.innerJoin(
        'collection_posts',
        'posts.id',
        'collection_posts.postId',
      );
    }
    if (options.orderBy === 'rank') {
      query.groupBy('rank');
    }

    if (options.noAnswers) {
      query.whereNull('answers.postId');
    }

    if (options.hasAnswers) {
      query.whereNotNull('answers.postId');
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

    if (options.includeTrend || options.orderBy === 'trend') {
      query.select(
        this.db.raw(
          `(
            (SELECT COALESCE(SUM(score), 0) FROM post_votes WHERE "postId" = posts.id) * 40 + 
            (SELECT COALESCE(COUNT(*), 0) FROM answers WHERE "postId" = posts.id) * 20 +
            (SELECT COALESCE(COUNT(*), 0) FROM post_views WHERE "postId" = posts.id) * 8
          ) / 
          POWER(
            EXTRACT(EPOCH FROM (now() - posts.created)) / 21600 + 1,
            1.8
          ) as trend`,
        ),
      );
    }

    if (options.ids) {
      query.whereIn('posts.id', options.ids);
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
      includeTotal
        ? this.db(totalQuery.as('totalQuery')).count('* as CNT').first()
        : undefined,
    ]);
    const rows = results[0] as RawPostEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      posts: await Promise.all(
        rows.map(async val => {
          return this.mapPostEntity(val, user_ref, {
            ...opts,
            includeAnswers: options.includeAnswers ?? opts?.includeAnswers,
            includeVotes: options.includeVotes ?? opts?.includeVotes,
            includeEntities: options.includeEntities ?? opts?.includeEntities,
            includeAttachments:
              options.includeAttachments ?? opts?.includeAttachments,
            includeExperts: options.includeExperts ?? opts?.includeExperts,
          });
        }),
      ),
      total,
    };
  }

  async getPost(
    user_ref: string,
    id: number,
    recordView?: boolean,
    options?: PostOptions,
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
      options,
    );
  }

  async getPostByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
    options?: PostOptions,
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
      options,
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
    opts?: PostOptions;
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
      opts,
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
      this.addTags(posts[0].id, tags),
      this.addEntities(posts[0].id, entities),
    ]);

    await this.updateAttachments(
      'postId',
      content,
      images ?? [],
      posts[0].id,
      headerImage,
    );

    return this.mapPostEntity(posts[0], user_ref, opts);
  }

  async commentPost(
    post_id: number,
    user_ref: string,
    content: string,
    created: Date,
    options?: PostOptions,
  ): Promise<MaybePost> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        postId: post_id,
      })
      .into('comments');

    return await this.getPost(user_ref, post_id, false, options);
  }

  async updatePostComment(
    post_id: number,
    id: number,
    user_ref: string,
    content: string,
    options?: PostOptions,
  ): Promise<MaybePost> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('postId', '=', post_id);
    await query.update({ content, updatedBy: user_ref, updated: new Date() });
    return this.getPost(user_ref, post_id, false, options);
  }

  async deletePostComment(
    post_id: number,
    id: number,
    user_ref: string,
    options?: PostOptions,
  ): Promise<MaybePost> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('postId', '=', post_id);
    await query.delete();
    return this.getPost(user_ref, post_id, false, options);
  }

  async commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    await this.db
      .insert({
        author: user_ref,
        content,
        created,
        answerId: answer_id,
      })
      .into('comments');
    return this.getAnswer(answer_id, user_ref, options);
  }

  async updateAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    content: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);
    await query.update({ content, updatedBy: user_ref, updated: new Date() });
    return this.getAnswer(answer_id, user_ref, options);
  }

  async deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const query = this.db('comments')
      .where('id', '=', id)
      .where('answerId', '=', answer_id);
    await query.delete();
    return this.getAnswer(answer_id, user_ref, options);
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
    opts?: PostOptions;
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
      opts,
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
      this.addTags(id, tags, true),
      this.addEntities(id, entities, true),
    ]);

    await this.updateAttachments(
      'postId',
      content,
      images ?? [],
      id,
      headerImage,
    );

    return await this.getPost(user_ref, id, false, opts);
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
    options?: AnswerOptions,
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

    await this.updateAttachments(
      'answerId',
      answer,
      images ?? [],
      answers[0].id,
    );

    return this.getAnswer(answers[0].id, user_ref, options);
  }

  async updateAnswer(
    user_ref: string,
    postId: number,
    answerId: number,
    answer: string,
    images?: number[],
    options?: AnswerOptions,
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

    await this.updateAttachments('answerId', answer, images ?? [], answerId);

    return this.getAnswer(answerId, user_ref, options);
  }

  async getAnswers(
    user_ref: string,
    options: AnswersQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: AnswerOptions,
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
      parseFilter(filters, query, this.db, 'answer');
    }

    if (options.tags) {
      const tags = filterTags(options.tags);
      if (options.tagsRelation === 'or') {
        query.innerJoin('post_tags', 'answers.postId', 'post_tags.postId');
        query.innerJoin('tags', 'post_tags.tagId', 'tags.id');
        query.whereIn('tags.tag', tags);
      } else {
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
    }

    if (options.entities) {
      if (options.entitiesRelation === 'or') {
        query.innerJoin(
          'post_entities',
          'answers.postId',
          'post_entities.postId',
        );
        query.innerJoin('entities', 'post_entities.entityId', 'entities.id');
        query.whereIn('entities.entity_ref', options.entities);
      } else {
        options.entities.forEach((t, i) => {
          query.innerJoin(
            `post_entities AS pe${i}`,
            'answers.postId',
            `pe${i}.postId`,
          );
          query.innerJoin(`entities AS e${i}`, `pe${i}.entityId`, `e${i}.id`);
          query.where(`e${i}.entity_ref`, '=', t);
        });
      }
    }

    if (options.noCorrectAnswer) {
      query.where('correct', '=', false);
    }

    if (options.noVotes) {
      query.whereNull('answer_votes.answerId');
    }

    if (options.searchQuery) {
      this.applySearchQuery(query, ['answers.content'], options.searchQuery);
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

    if (options.ids) {
      query.whereIn('answers.id', options.ids);
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
          return this.mapAnswer(val, user_ref, opts);
        }),
      ),
      total,
    };
  }

  async getAnswer(
    answerId: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    const answers = await this.getAnswerBaseQuery().where('id', '=', answerId);
    return this.mapAnswer(answers[0], user_ref, options);
  }

  async getComments(options?: { ids?: number[] }): Promise<Comment[]> {
    const query = this.db('comments');
    if (options?.ids) {
      query.whereIn('id', options.ids);
    }
    const comments = await query.select();
    return await Promise.all(comments.map(this.mapComment));
  }

  async getComment(
    commentId: number,
    opts?: { postId?: number; answerId?: number },
  ): Promise<MaybeComment> {
    const query = this.db<RawCommentEntity>('comments') // nosonar
      .where('comments.id', '=', commentId);
    if (opts?.postId) {
      query.andWhere('comments.postId', '=', opts.postId);
    }
    if (opts?.answerId) {
      query.andWhere('comments.answerId', '=', opts.answerId);
    }

    const comments = await query.select();
    if (comments.length === 0) {
      return null;
    }
    return await this.mapComment(comments[0]);
  }

  async deleteAnswer(id: number): Promise<boolean> {
    const query = this.db('answers').where('id', '=', id);
    return !!(await query.delete());
  }

  async deletePostVote(user_ref: string, postId: number): Promise<boolean> {
    return !!(await this.db('post_votes')
      .where('author', '=', user_ref)
      .where('postId', '=', postId)
      .delete());
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

  async getUsersWhoFavoritedPost(postId: number): Promise<string[]> {
    const query = this.db('user_favorite').where('postId', '=', postId);
    const users = await query.select('user');
    return users.map(u => u.user);
  }

  async deleteAnswerVote(user_ref: string, answerId: number): Promise<boolean> {
    return !!(await this.db('answer_votes')
      .where('author', '=', user_ref)
      .where('answerId', '=', answerId)
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

  async getTags(
    options?: { noDescription?: boolean; ids?: number[] } & TagsQuery,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<TagsResponse> {
    const { includeExperts = true } = options ?? {};
    const query = this.getTagBaseQuery();
    if (options?.noDescription) {
      query.whereNull('tags.description');
    }

    if (options?.searchQuery) {
      this.applySearchQuery(
        query,
        ['tags.tag', 'tags.description'],
        options.searchQuery,
      );
    }

    if (options?.ids) {
      query.whereIn('tags.id', options.ids);
    }

    if (filters) {
      parseFilter(filters, query, this.db);
    }

    const totalQuery = query.clone();

    if (options?.orderBy) {
      query.orderBy(options?.orderBy, options?.order || 'desc');
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);

    const rows = results[0];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      total,
      tags: await Promise.all(
        rows.map(async tag => {
          return {
            id: tag.id,
            tag: tag.tag,
            description: tag.description,
            postsCount: this.mapToInteger(tag.postsCount),
            followerCount: this.mapToInteger(tag.followerCount),
            experts: includeExperts
              ? await this.getTagExpertsById(tag.id)
              : undefined,
          };
        }),
      ),
    };
  }

  async getTagById(id: number): Promise<TagResponse | null> {
    const query = this.getTagBaseQuery();
    const tags = await query.where('tags.id', '=', id);

    if (tags.length === 0) {
      return null;
    }
    return {
      id: tags[0].id,
      tag: tags[0].tag,
      description: tags[0].description,
      postsCount: this.mapToInteger(tags[0].postsCount),
      followerCount: this.mapToInteger(tags[0].followerCount),
      experts: await this.getTagExpertsById(tags[0].id),
    };
  }

  async getTag(tag: string): Promise<TagResponse | null> {
    const query = this.getTagBaseQuery();
    const tags = await query.where('tags.tag', '=', tag);

    if (tags.length === 0) {
      return null;
    }
    return {
      id: tags[0].id,
      tag: tags[0].tag,
      description: tags[0].description,
      postsCount: this.mapToInteger(tags[0].postsCount),
      followerCount: this.mapToInteger(tags[0].followerCount),
      experts: await this.getTagExpertsById(tags[0].id),
    };
  }

  async deleteTag(id: number): Promise<boolean> {
    const query = this.db('tags').where('id', '=', id);
    return !!(await query.delete());
  }

  async getTagExperts(tags: string[]): Promise<string[]> {
    if (tags.length === 0) {
      return [];
    }
    const query = this.db<RawTagExpert>('tag_experts')
      .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
      .whereIn('tags.tag', tags);
    const resp = await query.select('entityRef');
    return [...new Set(resp.map(r => r.entityRef))];
  }

  async createTag(
    tag: string,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    const trimmed = tag.trim();
    const ret = await this.db
      .insert({ tag: trimmed, description })
      .into('tags')
      .returning(['id'])
      .onConflict('tag')
      .ignore();
    if (ret && experts && experts.length > 0) {
      await this.updateTagExperts(ret[0].id, experts);
    }
    return this.getTag(trimmed);
  }

  async updateTag(
    id: number,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    await this.db('tags')
      .where('tags.id', '=', id)
      .update({ description: description ?? null });
    if (experts && experts.length > 0) {
      await this.updateTagExperts(id, experts);
    }
    return this.getTagById(id);
  }

  async getUsersCount(): Promise<number> {
    const query = await this.db('unique_authors').count('author as CNT');
    return Number(query[0].CNT);
  }

  async getUsers(
    options?: { entityRefs?: string[] } & UsersQuery,
  ): Promise<UsersResponse> {
    const query = this.getUserBaseQuery();

    if (options?.entityRefs) {
      query.whereIn('unique_authors.author', options.entityRefs);
    }

    const totalQuery = query.clone();

    if (options?.orderBy) {
      query.orderBy(options?.orderBy, options?.order || 'desc');
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);

    const rows = results[0];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      total,
      users: rows.map(r => ({
        userRef: r.author,
        totalViews: this.mapToInteger(r.totalViews),
        totalQuestions: this.mapToInteger(r.totalQuestions),
        totalAnswers: this.mapToInteger(r.totalAnswers),
        totalComments:
          this.mapToInteger(r.postComments) +
          this.mapToInteger(r.answerComments),
        totalVotes:
          this.mapToInteger(r.postVotes) + this.mapToInteger(r.answerVotes),
        totalArticles: this.mapToInteger(r.totalArticles),
        totalFollowers: this.mapToInteger(r.totalFollowers),
      })),
    };
  }

  async getUser(user_ref: string): Promise<UserResponse | null> {
    const q = this.getUserBaseQuery();
    const rows = await q.where('author', user_ref);
    if (rows.length === 0) {
      return null;
    }
    return {
      userRef: rows[0].author,
      totalViews: this.mapToInteger(rows[0].totalViews),
      totalQuestions: this.mapToInteger(rows[0].totalQuestions),
      totalAnswers: this.mapToInteger(rows[0].totalAnswers),
      totalComments:
        this.mapToInteger(rows[0].postComments) +
        this.mapToInteger(rows[0].answerComments),
      totalVotes:
        this.mapToInteger(rows[0].postVotes) +
        this.mapToInteger(rows[0].answerVotes),
      totalArticles: this.mapToInteger(rows[0].totalArticles),
      totalFollowers: this.mapToInteger(rows[0].totalFollowers),
    };
  }

  async getUserCollections(
    user_ref: string,
    options?: CollectionOptions,
  ): Promise<UserCollectionsResponse> {
    const rows = await this.db('user_collections')
      .where('userRef', user_ref)
      .leftJoin(
        'collections',
        'user_collections.collectionId',
        'collections.id',
      )
      .select('*');

    return {
      collections: await Promise.all(
        rows.map(async val => {
          return this.mapCollectionEntity(val, user_ref, options);
        }),
      ),
      count: rows.length,
    };
  }

  async getUsersForCollection(collectionId: number): Promise<string[]> {
    const users = await this.db('user_collections')
      .where('collectionId', collectionId)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async followCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    await this.db
      .insert(
        {
          userRef: user_ref,
          collectionId,
        },
        ['collectionId'],
      )
      .into('user_collections');
    return true;
  }

  async unfollowCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    await this.db('user_collections')
      .where('userRef', user_ref)
      .where('collectionId', collectionId)
      .delete();
    return true;
  }

  async getUserTags(
    user_ref: string,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<UserTagsResponse> {
    const query = this.db('user_tags')
      .where('userRef', user_ref)
      .leftJoin('tags', 'user_tags.tagId', 'tags.id');

    if (filters) {
      parseFilter(filters, query, this.db);
    }
    const tags = await query.select('tags.tag');

    return {
      tags: tags.map(tag => tag.tag),
      count: tags.length,
    };
  }

  async getUsersForTags(tags?: string[]): Promise<string[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    const followingUsersQuery = this.db('user_tags')
      .leftJoin('tags', 'user_tags.tagId', 'tags.id')
      .whereIn('tags.tag', tags)
      .select('userRef');

    const [followingUsers, experts] = await Promise.all([
      followingUsersQuery,
      this.getTagExperts(tags),
    ]);

    return [
      ...new Set([...followingUsers.map(user => user.userRef), ...experts]),
    ];
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

  async getEntities(
    options?: { entityRefs?: string[] } & EntitiesQuery,
  ): Promise<EntitiesResponse> {
    const query = this.getEntitiesBaseQuery();
    if (options?.entityRefs) {
      query.whereIn('entities.entity_ref', options.entityRefs);
    }

    const totalQuery = query.clone();

    if (options?.orderBy) {
      query.orderBy(options?.orderBy, options?.order || 'desc');
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);

    const rows = results[0];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      total,
      entities: rows.map(entity => {
        return {
          id: entity.id,
          entityRef: entity.entity_ref,
          postsCount: this.mapToInteger(entity.postsCount),
          followerCount: this.mapToInteger(entity.followerCount),
        };
      }),
    };
  }

  async getEntity(entity_ref: string): Promise<EntityResponse | null> {
    const query = this.getEntitiesBaseQuery();
    const rows = await query.where('entity_ref', '=', entity_ref);
    if (rows.length === 0) {
      return null;
    }
    return {
      id: rows[0].id,
      entityRef: rows[0].entity_ref,
      postsCount: this.mapToInteger(rows[0].postsCount),
      followerCount: this.mapToInteger(rows[0].followerCount),
    };
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

  async getFollowedUsers(user_ref: string): Promise<UserUsersResponse> {
    const entities = await this.db('user_users')
      .where('userRef', user_ref)
      .select('followedUserRef');

    return {
      followedUserRefs: entities.map(e => e.followedUserRef),
      count: entities.length,
    };
  }

  async getFollowingUsers(user_ref: string): Promise<string[]> {
    const users = await this.db('user_users')
      .where('followedUserRef', user_ref)
      .select('userRef');
    return users.map(user => user.userRef);
  }

  async followUser(
    user_ref: string,
    followedUserRef: string,
  ): Promise<boolean> {
    await this.db
      .insert({
        userRef: user_ref,
        followedUserRef,
      })
      .into('user_users');
    return true;
  }

  async unfollowUser(
    user_ref: string,
    followedUserRef: string,
  ): Promise<boolean> {
    await this.db('user_users')
      .where('userRef', user_ref)
      .where('followedUserRef', followedUserRef)
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

    if (options?.type) {
      query.where('q.type', '=', options.type);
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

    if (options?.type) {
      query.where('q.type', '=', options.type);
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
    postId,
    answerId,
    collectionId,
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
          postId,
          answerId,
          collectionId,
        },
        ['id', 'uuid', 'locationUri', 'locationType'],
      )
      .into('attachments');

    return attachments[0];
  }

  async deleteAttachment(uuid: string): Promise<boolean> {
    const query = this.db('attachments').where('uuid', '=', uuid);
    return !!(await query.delete());
  }

  async getAttachment(uuid: string): Promise<Attachment | undefined> {
    const rawAttachment = await this.db<RawAttachment>('attachments')
      .where('uuid', '=', uuid)
      .first();

    if (!rawAttachment) {
      return undefined;
    }

    return this.mapAttachment(rawAttachment);
  }

  async getDeletableAttachments(dayLimit: number): Promise<Attachment[]> {
    const now = new Date();
    now.setDate(now.getDate() - dayLimit);
    return this.db<Attachment>('attachments')
      .whereNull('postId')
      .whereNull('answerId')
      .whereNull('collectionId')
      .where(`created`, '<=', now)
      .select();
  }

  async getTotalViews(
    user_ref: string,
    lastDays?: number,
    excludeUser?: boolean,
  ): Promise<number> {
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

    if (excludeUser) {
      postViewsQuery.where('post_views.author', '!=', user_ref);
    }

    const answerViewsQuery = this.db('post_views')
      .innerJoin('answers', 'post_views.postId', 'answers.postId')
      .innerJoin('posts', 'post_views.postId', 'posts.id')
      .where('answers.author', user_ref)
      .whereNot('posts.author', user_ref);
    if (lastDays) {
      answerViewsQuery.where('answers.created', '>', now);
    }

    if (excludeUser) {
      answerViewsQuery.where('post_views.author', '!=', user_ref);
    }

    const postViews = await postViewsQuery.count('* as total');
    const answerViews = await answerViewsQuery.count('* as total');

    return Number(postViews[0].total) + Number(answerViews[0].total);
  }

  async saveUserStats(user: UserResponse, date: Date): Promise<void> {
    await this.db('user_stats')
      .insert({
        ...user,
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
        totalUsers: await this.getUsersCount(),
        totalTags: await this.getCount('tags'),
        totalViews: await this.getCount('post_views'),
        totalComments: await this.getCount('comments'),
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
    options: CollectionsQuery,
    opts?: CollectionOptions,
  ): Promise<Collections> {
    const query = this.getCollectionsBaseQuery();

    if (options.owner) {
      query.where('owner', options.owner);
    }

    if (options.fromDate && options.toDate) {
      query.whereBetween('collections.created', [
        `${options.fromDate} 00:00:00.000+00`,
        `${options.toDate} 23:59:59.999+00`,
      ]);
    }

    if (options.searchQuery) {
      this.applySearchQuery(
        query,
        ['collections.title', 'collections.description'],
        options.searchQuery,
      );
    }

    if (options.tags) {
      const tags = filterTags(options.tags);
      if (options.tagsRelation === 'or') {
        query.innerJoin(
          'post_tags',
          'collection_posts.postId',
          'post_tags.postId',
        );
        query.innerJoin('tags', 'post_tags.tagId', 'tags.id');
        query.whereIn('tags.tag', tags);
      } else {
        tags.forEach((t, i) => {
          query.innerJoin(
            `post_tags AS qt${i}`,
            'collection_posts.postId',
            `qt${i}.postId`,
          );
          query.innerJoin(`tags AS t${i}`, `qt${i}.tagId`, `t${i}.id`);
          query.where(`t${i}.tag`, '=', t);
        });
      }
    }

    if (options.entities) {
      if (options.entitiesRelation === 'or') {
        query.innerJoin(
          'post_entities',
          'collection_posts.postId',
          'post_entities.postId',
        );
        query.innerJoin('entities', 'post_entities.entityId', 'entities.id');
        query.whereIn('entities.entity_ref', options.entities);
      } else {
        options.entities.forEach((t, i) => {
          query.innerJoin(
            `post_entities AS pe${i}`,
            'collection_posts.postId',
            `pe${i}.postId`,
          );
          query.innerJoin(`entities AS e${i}`, `pe${i}.entityId`, `e${i}.id`);
          query.where(`e${i}.entity_ref`, '=', t);
        });
      }
    }

    if (options.ids) {
      query.whereIn('collections.id', options.ids);
    }

    if (opts?.filters) {
      parseFilter(opts.filters, query, this.db);
    }

    const totalQuery = query.clone();

    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order || 'desc');
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
    const rows = results[0] as RawCollectionEntity[];
    const total = this.mapToInteger((results[1] as any)?.CNT);
    return {
      collections: await Promise.all(
        rows.map(async val => {
          return this.mapCollectionEntity(val, user_ref, {
            ...opts,
            includePosts: options.includePosts ?? opts?.includePosts,
            includeExperts: options.includeExperts ?? opts?.includeExperts,
          });
        }),
      ),
      total,
    };
  }

  async getCollection(
    user_ref: string,
    id: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    const collections = await this.db('collections').where('id', '=', id);
    if (collections.length === 0) {
      return null;
    }
    return this.mapCollectionEntity(collections[0], user_ref, options);
  }

  async createCollection(options: {
    user_ref: string;
    title: string;
    description?: string;
    created: Date;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<Collection> {
    const { user_ref, title, description, created, images, headerImage, opts } =
      options;
    const collections = await this.db
      .insert(
        {
          owner: user_ref,
          title,
          description,
          created,
          headerImage,
        },
        ['id'],
      )
      .into('collections')
      .returning(['id', 'title', 'description', 'created', 'headerImage']);

    await this.updateAttachments(
      'collectionId',
      description ?? '',
      images ?? [],
      collections[0].id,
      headerImage,
    );

    return this.mapCollectionEntity(collections[0], user_ref, opts);
  }

  async updateCollection(options: {
    id: number;
    user_ref: string;
    title: string;
    description?: string;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<MaybeCollection> {
    const { id, user_ref, title, description, images, headerImage, opts } =
      options;
    const query = this.db('collections').where('collections.id', '=', id);
    const rows = await query.update({
      title,
      description,
      headerImage,
    });

    if (!rows) {
      return null;
    }

    await this.updateAttachments(
      'collectionId',
      description ?? '',
      images ?? [],
      id,
      headerImage,
    );

    return await this.getCollection(user_ref, id, opts);
  }

  async deleteCollection(id: number): Promise<boolean> {
    const query = this.db('collections').where('id', '=', id);
    return !!(await query.delete());
  }

  async addPostToCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    await this.db
      .insert({
        collectionId: id,
        postId,
      })
      .into('collection_posts')
      .onConflict()
      .ignore();
    return await this.getCollection(user_ref, id, options);
  }

  async removePostFromCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    await this.db('collection_posts')
      .where('collectionId', id)
      .where('postId', postId)
      .delete();
    return await this.getCollection(user_ref, id, options);
  }

  async getTemplates(): Promise<Templates> {
    const templates = await this.db('templates').select('*');
    return {
      templates: await Promise.all(
        templates.map(t => this.mapTemplateEntity(t)),
      ),
      total: templates.length,
    };
  }

  async createTemplate(options: {
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template> {
    const {
      title,
      questionTitle,
      questionContent,
      description,
      tags,
      entities,
    } = options;
    const templates = await this.db
      .insert(
        {
          title,
          description,
          questionTitle,
          questionContent,
        },
        ['id'],
      )
      .into('templates')
      .returning([
        'id',
        'title',
        'description',
        'questionTitle',
        'questionContent',
      ]);
    await Promise.all([
      this.addTags(templates[0].id, tags, true, 'template_tags', 'templateId'),
      this.addEntities(
        templates[0].id,
        entities,
        true,
        'template_entities',
        'templateId',
      ),
    ]);

    return this.mapTemplateEntity(templates[0]);
  }

  async getTemplate(id: number): Promise<MaybeTemplate> {
    const templates = await this.db('templates').where('id', '=', id);
    if (templates.length === 0) {
      return null;
    }
    return this.mapTemplateEntity(templates[0]);
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const query = this.db('templates').where('id', '=', id);
    return !!(await query.delete());
  }

  async updateTemplate(options: {
    id: number;
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<MaybeTemplate> {
    const {
      id,
      title,
      description,
      questionTitle,
      questionContent,
      tags,
      entities,
    } = options;
    const query = this.db('templates').where('templates.id', '=', id);
    const rows = await query.update({
      title,
      description,
      questionTitle,
      questionContent,
    });

    if (!rows) {
      return null;
    }

    await Promise.all([
      this.addTags(id, tags, true, 'template_tags', 'templateId'),
      this.addEntities(id, entities, true, 'template_entities', 'templateId'),
    ]);

    return await this.getTemplate(id);
  }

  async getAIAnswer(postId: number): Promise<AIResponse | null> {
    const row = await this.db<RawPostAIAnswer>('post_ai_answers')
      .where('postId', postId)
      .select()
      .first();
    if (!row) {
      return null;
    }
    return {
      answer: row.answer,
      created: row.created,
    };
  }

  async saveAIAnswer(postId: number, response: AIResponse): Promise<void> {
    await this.db
      .insert({
        postId,
        answer: response.answer,
        created: new Date(),
      })
      .into('post_ai_answers')
      .onConflict()
      .ignore();
  }

  async deleteAIAnswer(postId: number): Promise<boolean> {
    return !!(await this.db('post_ai_answers')
      .where('postId', postId)
      .delete());
  }

  async getPostRank(
    collectionId: number,
    postId: number,
  ): Promise<number | null> {
    const rank = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('postId', postId)
      .select('rank')
      .first();
    return rank?.rank ?? null;
  }

  async getTopRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .orderBy('rank', 'desc')
      .limit(1)
      .select(['postId', 'rank']);
    return post[0] ? { postId: post[0].postId, rank: post[0].rank } : null;
  }

  async getBottomRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .orderBy('rank', 'asc')
      .limit(1)
      .select(['postId', 'rank']);
    return post[0] ? { postId: post[0].postId, rank: post[0].rank } : null;
  }

  async getNextRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    const rank = await this.getPostRank(collectionId, postId);
    if (rank === null) {
      return null;
    }
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('rank', '>', rank)
      .orderBy('rank', 'asc')
      .select(['postId', 'rank'])
      .first();
    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async getPreviousRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    const rank = await this.getPostRank(collectionId, postId);
    if (rank === null) {
      return null;
    }
    const post = await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('rank', '<', rank)
      .orderBy('rank', 'desc')
      .select(['postId', 'rank'])
      .first();
    return post ? { postId: post.postId, rank: post.rank } : null;
  }

  async updatePostRank(
    collectionId: number,
    postId: number,
    rank: number,
  ): Promise<void> {
    await this.db('collection_posts')
      .where('collectionId', collectionId)
      .where('postId', postId)
      .update({ rank });
  }

  // Add a method to manually update trends if needed
  async updatePostTrends(): Promise<void> {
    await this.db.raw('SELECT update_all_post_trends();');
  }

  private async getTagExpertsById(id: number) {
    const rows = await this.db('tag_experts')
      .where('tagId', id)
      .select('entityRef');
    return rows.map(r => r.entityRef);
  }

  private async updateTagExperts(id: number, experts: string[]) {
    await this.db('tag_experts').where('tagId', id).delete();
    await this.db
      .insert(experts.map(e => ({ tagId: id, entityRef: e })))
      .into('tag_experts')
      .onConflict(['tagId', 'entityRef'])
      .merge();
  }

  private getEntitiesBaseQuery() {
    const entityId = this.db.ref('entities.id');
    const entityRef = this.db.ref('entities.entity_ref');
    const postsCount = this.db('post_entities')
      .where('post_entities.entityId', entityId)
      .count('*')
      .as('postsCount');

    const followerCount = this.db('user_entities')
      .where('user_entities.entityRef', entityRef)
      .count('*')
      .as('followerCount');

    return this.db('entities')
      .rightJoin('post_entities', 'entities.id', 'post_entities.entityId')
      .orderBy('postsCount', 'desc')
      .select('id', 'entity_ref', postsCount, followerCount)
      .groupBy('entities.id');
  }

  private getTagBaseQuery() {
    const tagRef = this.db.ref('tags.id');
    const postsCount = this.db('post_tags')
      .where('post_tags.tagId', tagRef)
      .count('*')
      .as('postsCount');

    const followerCount = this.db('user_tags')
      .where('user_tags.tagId', tagRef)
      .count('*')
      .as('followerCount');

    return this.db('tags')
      .leftJoin('post_tags', 'tags.id', 'post_tags.tagId')
      .orderBy('postsCount', 'desc')
      .select('id', 'tag', 'description', postsCount, followerCount)
      .groupBy('tags.id');
  }

  private getUserBaseQuery() {
    if (this.db.client.config.client !== 'pg') {
      // Subqueries do not work in sqlite so we just return all stats as empty, at least for now
      return this.db('posts')
        .select([
          'author',
          this.db.raw('0 as totalViews'),
          this.db.raw('0 as totalQuestions'),
          this.db.raw('0 as totalArticles'),
          this.db.raw('0 as totalAnswers'),
          this.db.raw('0 as answerComments'),
          this.db.raw('0 as postComments'),
          this.db.raw('0 as answerVotes'),
          this.db.raw('0 as postVotes'),
          this.db.raw('0 as totalFollowers'),
        ])
        .distinct();
    }

    const authorRef = this.db.ref('unique_authors.author');

    const views = this.db('post_views')
      .where('post_views.author', authorRef)
      .count('*')
      .as('totalViews');

    const questions = this.db('posts')
      .where('posts.author', authorRef)
      .where('posts.type', 'question')
      .count('*')
      .as('totalQuestions');

    const articles = this.db('posts')
      .where('posts.author', authorRef)
      .where('posts.type', 'article')
      .count('*')
      .as('totalArticles');

    const answers = this.db('answers')
      .where('answers.author', authorRef)
      .count('*')
      .as('totalAnswers');

    const comments = this.db('comments')
      .where('comments.author', authorRef)
      .count('*')
      .as('comments');
    const aVotes = this.db('answer_votes')
      .where('answer_votes.author', authorRef)
      .count('*')
      .as('answerVotes');

    const pVotes = this.db('post_votes')
      .where('post_votes.author', authorRef)
      .count('*')
      .as('postVotes');

    const followers = this.db('user_users')
      .where('user_users.followedUserRef', authorRef)
      .count('*')
      .as('totalFollowers');

    return this.db('unique_authors').select(
      'author',
      views,
      questions,
      answers,
      articles,
      comments,
      pVotes,
      aVotes,
      followers,
    );
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
    options?: CollectionOptions,
  ): Promise<Collection> {
    const { postFilters, includePosts = true } = options ?? {};
    const results = await Promise.all([
      includePosts
        ? this.getPosts(
            user_ref,
            { collectionId: val.id, includeEntities: true },
            postFilters,
            {
              tagsFilter: options?.tagFilters,
              includeComments: false,
              includeAnswers: false,
              includeAttachments: false,
              includeVotes: false,
              includeTotal: false,
              includeExperts: options?.includeExperts ?? false,
            },
          )
        : { posts: [] },
      this.db('attachments').where('collectionId', val.id).select('id'),
      this.db('user_collections')
        .count('*')
        .as('followers')
        .where('collectionId', val.id)
        .first(),
      options?.includeExperts ?? true
        ? this.getCollectionExperts(val.id)
        : undefined,
    ]);

    const entities = compact([
      ...new Set(results[0].posts.map(p => p.entities).flat()),
    ]);
    const tags = compact([
      ...new Set(results[0].posts.map(p => p.tags).flat()),
    ]);

    return {
      id: val.id,
      title: val.title,
      owner: val.owner,
      description: val.description,
      created: val.created as Date,
      posts: results[0].posts,
      headerImage: val.headerImage,
      postsCount: this.mapToInteger(val.postsCount),
      entities,
      tags,
      images: results[1].map(r => r.id),
      followers: this.mapToInteger(results[2]!.count),
      experts: results[3],
    };
  }

  private async getCollectionExperts(collectionId: number): Promise<string[]> {
    const rows = await this.db('tag_experts')
      .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
      .leftJoin('post_tags', 'post_tags.tagId', 'tags.id')
      .leftJoin(
        'collection_posts',
        'collection_posts.postId',
        'post_tags.postId',
      )
      .where('collection_posts.collectionId', collectionId)
      .select('tag_experts.entityRef');
    return [...new Set(rows.map(r => r.entityRef))];
  }

  private async mapTemplateEntity(val: RawTemplate): Promise<Template> {
    const additionalInfo = await Promise.all([
      this.getRelatedTags(val.id, 'template_tags', 'templateId'),
      this.getRelatedEntities(val.id, 'template_entities', 'templateId'),
    ]);
    return {
      id: val.id,
      title: val.title,
      description: val.description,
      questionTitle: val.questionTitle ?? undefined,
      questionContent: val.questionContent ?? undefined,
      tags: additionalInfo[0],
      entities: additionalInfo[1],
    };
  }

  private async mapPostEntity(
    val: RawPostEntity,
    user_ref: string,
    options?: PostOptions,
  ): Promise<Post> {
    const {
      includeTags = true,
      includeAnswers = true,
      includeVotes = true,
      includeEntities = true,
      includeComments = true,
      includeAttachments = true,
      includeExperts = true,
      tagsFilter,
    } = options ?? {};
    // TODO: This could maybe done with join
    const additionalInfo = await Promise.all([
      includeTags
        ? this.getRelatedTags(val.id, 'post_tags', 'postId', tagsFilter)
        : undefined,
      includeAnswers
        ? this.getPostAnswers(val.id, user_ref, {
            ...options,
            includePost: false,
            filter: options?.answersFilter,
          })
        : undefined,
      includeVotes ? this.getPostVotes(val.id) : undefined,
      includeEntities ? this.getRelatedEntities(val.id) : undefined,
      includeComments
        ? this.getPostComments(val.id, options?.commentsFilter)
        : undefined,
      includeAttachments
        ? this.db('attachments').select('id').where('postId', val.id)
        : undefined,
      includeExperts ? this.getPostExperts(val.id) : undefined,
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
      images: additionalInfo[5]?.map(r => r.id),
      experts: additionalInfo[6],
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
    options?: AnswerOptions,
  ): Promise<Answer> {
    const {
      includeVotes = true,
      includeComments = true,
      includePost = true,
      includeExperts = true,
    } = options ?? {};
    const additionalInfo = await Promise.all([
      includeVotes ? this.getAnswerVotes(val.id) : undefined,
      includeComments
        ? this.getAnswerComments(val.id, options?.commentsFilter)
        : undefined,
      includePost ? this.getPost(user_ref, val.postId, false) : undefined,
      this.db('attachments').select('id').where('answerId', val.id),
      includeExperts ? this.getAnswerExperts(val.id) : undefined,
    ]);
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
      score: this.mapToInteger(val.score),
      votes: additionalInfo[0],
      comments: additionalInfo[1],
      anonymous: val.anonymous,
      post: additionalInfo[2] ?? undefined,
      images: additionalInfo[3].map(r => r.id),
      experts: additionalInfo[4] ?? undefined,
    };
  }

  private mapVote(val: RawPostVoteEntity | RawAnswerVoteEntity): Vote {
    return {
      author: val.author,
      score: val.score,
      timestamp: val.timestamp,
    };
  }

  private mapAttachment(val: RawAttachment): Attachment {
    return {
      ...val,
      created:
        val.created instanceof Date ? val.created : new Date(val.created),
    };
  }

  private async getRelatedTags(
    id: number,
    tableName: string = 'post_tags',
    columnName: string = 'postId',
    tagsFilter?: PermissionCriteria<QetaFilters>,
  ): Promise<string[]> {
    const query = this.db<RawTagEntity>('tags')
      .leftJoin(tableName, 'tags.id', `${tableName}.tagId`)
      .where(`${tableName}.${columnName}`, '=', id);

    if (tagsFilter) {
      parseFilter(tagsFilter, query, this.db, 'tags');
    }

    const rows = await query.select();
    return rows.map(val => val.tag);
  }

  private async getPostComments(
    postId: number,
    commentsFilter?: PermissionCriteria<QetaFilters>,
  ): Promise<RawCommentEntity[]> {
    const query = this.db<RawCommentEntity>('comments')
      .where('comments.postId', '=', postId)
      .orderBy('created');
    if (commentsFilter) {
      parseFilter(commentsFilter, query, this.db, 'comments');
    }
    return query.select();
  }

  private async getPostExperts(postId: number): Promise<string[]> {
    const rows = await this.db('tag_experts')
      .leftJoin('post_tags', 'tag_experts.tagId', 'post_tags.tagId')
      .where('post_tags.postId', postId)
      .select('tag_experts.entityRef');
    return [...new Set(rows.map(r => r.entityRef))];
  }

  private async getAnswerComments(
    answerId: number,
    commentsFilter?: PermissionCriteria<QetaFilters>,
  ): Promise<RawCommentEntity[]> {
    const query = this.db<RawCommentEntity>('comments')
      .where('comments.answerId', '=', answerId)
      .orderBy('created');
    if (commentsFilter) {
      parseFilter(commentsFilter, query, this.db, 'comments');
    }
    return query.select();
  }

  private async getRelatedEntities(
    id: number,
    tableName: string = 'post_entities',
    columnName: string = 'postId',
  ): Promise<string[]> {
    const rows = await this.db<RawTagEntity>('entities')
      .leftJoin(tableName, 'entities.id', `${tableName}.entityId`)
      .where(`${tableName}.${columnName}`, '=', id)
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

  private async getAnswerExperts(answerId: number): Promise<string[]> {
    const rows = await this.db('tag_experts')
      .leftJoin('tags', 'tag_experts.tagId', 'tags.id')
      .leftJoin('post_tags', 'post_tags.tagId', 'tags.id')
      .leftJoin('answers', 'answers.postId', 'post_tags.postId')
      .where('answers.id', answerId)
      .select('tag_experts.entityRef');
    return [...new Set(rows.map(r => r.entityRef))];
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
    options?: AnswerOptions,
  ): Promise<Answer[]> {
    const query = this.getAnswerBaseQuery()
      .where('postId', '=', postId)
      .orderBy('answers.correct', 'desc')
      .orderBy('answers.created');

    if (options?.filter) {
      parseFilter(options.filter, query, this.db, 'answer');
    }

    const rows = await query.select();

    return await Promise.all(
      rows.map(async val => {
        return this.mapAnswer(val, user_ref, options);
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

  private getCollectionsBaseQuery() {
    const collectionRef = this.db.ref('collections.id');
    const postsCount = this.db('collection_posts')
      .where('collection_posts.collectionId', collectionRef)
      .count('*')
      .as('postsCount');

    return this.db<RawCollectionEntity>('collections')
      .select('collections.*', postsCount)
      .leftJoin(
        'collection_posts',
        'collections.id',
        'collection_posts.collectionId',
      )
      .leftJoin('posts', 'collection_posts.postId', 'posts.id')
      .groupBy('collections.id');
  }

  private async addTags(
    id: number,
    tagsInput?: string[],
    removeOld?: boolean,
    tableName: string = 'post_tags',
    columnName: string = 'postId',
  ) {
    const tags = filterTags(tagsInput);
    if (removeOld) {
      await this.db(tableName).where(columnName, '=', id).delete();
    }

    if (!tags || tags.length === 0) {
      return;
    }
    const existingTags = await this.db('tags')
      .whereIn('tag', tags)
      .returning('id')
      .select();
    const newTags = tags.filter(t => !existingTags.some(e => e.tag === t));
    const allTags: Record<string, string> = {
      ...TAGS,
      ...(await this.tagDatabase?.getTags()),
    };

    const tagIds = (
      await Promise.all(
        [...new Set(newTags)].map(async tag => {
          const trimmed = tag.trim();
          const description = trimmed in allTags ? allTags[trimmed] : undefined;

          return this.db
            .insert({ tag: trimmed, description })
            .into('tags')
            .returning('id')
            .onConflict('tag')
            .ignore();
        }),
      )
    )
      .flat()
      .map(tag => tag.id)
      .concat(existingTags.map(t => t.id));

    await Promise.all(
      tagIds.map(async tagId => {
        await this.db
          .insert({ [columnName]: id, tagId })
          .into(tableName)
          .onConflict()
          .ignore();
      }),
    );
  }

  private async addEntities(
    id: number,
    entitiesInput?: string[],
    removeOld?: boolean,
    tableName: string = 'post_entities',
    columnName: string = 'postId',
  ) {
    if (removeOld) {
      await this.db(tableName).where(columnName, '=', id).delete();
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
          .insert({ [columnName]: id, entityId })
          .into(tableName)
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

  private async updateAttachments(
    key: 'postId' | 'answerId' | 'collectionId',
    content: string,
    images: number[],
    id: number,
    headerImage?: string,
  ) {
    if (images.length > 0) {
      await this.db<Attachment>('attachments')
        .whereIn('id', images)
        .update({ [key]: id });
    }

    const attachments = await this.db<Attachment>('attachments')
      .where(key, id)
      .select('uuid');
    const uuids = attachments.map(a => a.uuid);
    const toRemove = uuids.filter(uuid => {
      return !(content.includes(uuid) || headerImage?.includes(uuid));
    });
    await this.db<Attachment>('attachments')
      .whereIn('uuid', toRemove)
      .update({ [key]: null });
  }

  private applySearchQuery(
    query: Knex.QueryBuilder,
    columns: string[],
    searchQuery: string,
  ) {
    if (this.db.client.config.client === 'pg') {
      query.whereRaw(
        `((to_tsvector(CONCAT(${columns.join(
          ',',
        )})) @@ to_tsquery(quote_literal(?) || ':*')))`,
        [`${searchQuery}`],
      );
    } else {
      query.whereRaw(`LOWER(CONCAT(${columns.join(',')})) LIKE LOWER(?)`, [
        `%${searchQuery}%`,
      ]);
    }
  }
}
