import {
  AIResponse,
  filterTags,
  Post,
  PostsQuery,
  PostStatus,
  PostType,
  Answer,
  Comment as QetaComment,
} from '@drodil/backstage-plugin-qeta-common';
import { AnswerOptions, MaybePost, PostOptions, Posts } from '../QetaStore';
import { QetaFilters } from '../../service/util';
import { Knex } from 'knex';
import { AnswersStore } from './AnswersStore';
import { CommentsStore } from './CommentsStore';
import { TagsStore } from './TagsStore';
import { EntitiesStore } from './EntitiesStore';
import { AttachmentsStore } from './AttachmentsStore';
// import { parseFilter, filterTags } from '../service/util'; // Removed
import { PermissionCriteria } from '@backstage/plugin-permission-common';
import { TAGS } from '../../tagDb';
import { BaseStore } from './BaseStore';

export interface RawPostEntity {
  id: number;
  author: string;
  title: string;
  content: string;
  status: string;
  created: Date | string;
  updated: Date | string;
  updatedBy: string;
  score: number | string;
  views: number | string;
  answersCount: number | string;
  correctAnswer: boolean | number;
  commentsCount: number | string;
  favorite: number | string;
  trend: number | string;
  anonymous: boolean;
  type: 'question' | 'article' | 'link';
  headerImage: string;
  url: string | null;
  published: Date | string | null;
}

export interface RawPostVoteEntity {
  postId: number;
  author: string;
  score: number;
  timestamp: Date;
}

export interface RawPostAIAnswer {
  id: number;
  answer: string;
  created: Date;
}

export class PostsStore extends BaseStore {
  private answersStore?: AnswersStore;

  constructor(
    protected readonly db: Knex,
    private readonly commentsStore: CommentsStore,
    private readonly tagsStore: TagsStore,
    private readonly entitiesStore: EntitiesStore,
    private readonly attachmentsStore: AttachmentsStore,
  ) {
    super(db);
  }

  setAnswersStore(answersStore: AnswersStore) {
    this.answersStore = answersStore;
  }

  async getAIAnswer(postId: number): Promise<AIResponse | null> {
    const row = await this.db('ai_answers').where('postId', postId).first();
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
        created: response.created,
      })
      .into('ai_answers')
      .onConflict('postId')
      .merge();
  }

  async deleteAIAnswer(postId: number): Promise<boolean> {
    const rows = await this.db('ai_answers').where('postId', postId).delete();
    return rows > 0;
  }

  async getPosts(
    user_ref: string,
    options: PostsQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: PostOptions,
  ): Promise<Posts> {
    const { includeTotal = true, includeDraftFilter = true } = opts ?? {};
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

    if (options.status) {
      if (options.status === 'draft') {
        query.where('posts.author', '=', user_ref);
      }
      query.where('posts.status', '=', options.status);
    } else if (includeDraftFilter) {
      query.where(q => {
        q.where('posts.status', 'active').orWhere(q2 => {
          q2.where('posts.status', 'draft').where(
            'posts.author',
            '=',
            user_ref,
          );
        });
      });
    }

    if (filters) {
      this.parseFilter(filters, query, this.db);
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
        tags?.forEach((t: string, i: number) => {
          query.innerJoin(`post_tags AS qt${i}`, 'posts.id', `qt${i}.postId`);
          query.innerJoin(`tags AS t${i}`, `qt${i}.tagId`, `t${i}.id`);
          query.where(`t${i}.tag`, '=', t);
        });
      }
    }

    if (options.entities) {
      const entityValues = Array.isArray(options.entities)
        ? options.entities
        : [options.entities];
      if (options.entitiesRelation === 'or') {
        query
          .innerJoin('post_entities', 'posts.id', 'post_entities.postId')
          .innerJoin('entities', 'post_entities.entityId', 'entities.id')
          .whereIn('entities.entity_ref', entityValues);
      } else {
        entityValues.forEach((t: string, i: number) => {
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
            (SELECT COALESCE(SUM(score), 0) FROM post_votes WHERE "postId" = posts.id) * 200 + 
            (SELECT COALESCE(COUNT(*), 0) FROM answers WHERE "postId" = posts.id) * 100 +
            (SELECT COALESCE(COUNT(*), 0) FROM user_favorite WHERE "postId" = posts.id) * 50 +
            (SELECT COALESCE(COUNT(*), 0) FROM post_views WHERE "postId" = posts.id) * 10 +
            (SELECT COALESCE(COUNT(*), 0) FROM comments WHERE "postId" = posts.id) * 30
          ) / 
          POWER(
            EXTRACT(EPOCH FROM (now() - posts.created)) / 172800 + 1,
            1.5
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
      posts: await this.mapPostEntities(rows, user_ref, {
        ...opts,
        includeAnswers: options.includeAnswers ?? opts?.includeAnswers,
        includeVotes: options.includeVotes ?? opts?.includeVotes,
        includeEntities: options.includeEntities ?? opts?.includeEntities,
        includeAttachments:
          options.includeAttachments ?? opts?.includeAttachments,
        includeExperts: options.includeExperts ?? opts?.includeExperts,
      }),
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
    const post = rows[0] as unknown as RawPostEntity;

    if ((recordView === undefined || recordView) && post.status === 'active') {
      this.recordPostView(id, user_ref);
    }
    const posts = await this.mapPostEntities(
      [rows[0] as unknown as RawPostEntity],
      user_ref,
      options,
    );
    return posts[0];
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
    const posts = await this.mapPostEntities(
      [rows[0] as unknown as RawPostEntity],
      user_ref,
      options,
    );
    return posts[0];
  }

  async createPost(options: {
    user_ref: string;
    title: string;
    content: string;
    created: Date;
    author?: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    anonymous?: boolean;
    type?: PostType;
    headerImage?: string;
    url?: string;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<Post> {
    const {
      user_ref,
      title,
      content,
      author,
      created,
      tags,
      entities,
      images,
      anonymous,
      type = 'question',
      headerImage,
      url,
      opts,
      status = 'active',
    } = options;
    const posts = await this.db
      .insert(
        {
          author: author ?? user_ref,
          title,
          content,
          created,
          anonymous: anonymous ?? false,
          type: type ?? 'question',
          headerImage,
          url,
          status,
          published: status === 'active' ? created : null,
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
        'status',
        'url',
      ]);

    await Promise.all([
      this.addTags(posts[0].id, tags),
      this.addEntities(posts[0].id, entities),
    ]);

    await this.updateAttachments(
      'postId',
      content ?? '',
      images ?? [],
      posts[0].id,
      headerImage,
    );

    return (await this.mapPostEntities([posts[0]], user_ref, opts))[0];
  }

  async updatePost(options: {
    id: number;
    user_ref: string;
    title?: string;
    content?: string;
    author?: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    headerImage?: string;
    url?: string;
    setUpdatedBy?: boolean;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<MaybePost> {
    const {
      id,
      user_ref,
      title,
      content,
      author,
      tags,
      entities,
      images,
      headerImage,
      url,
      setUpdatedBy = true,
      opts,
      status = 'active',
    } = options;

    // Check if this is a transition from draft to active
    const currentPost = await this.db('posts')
      .select('status', 'published')
      .where('id', '=', id)
      .first();

    const shouldSetPublished =
      currentPost &&
      currentPost.status === 'draft' &&
      status === 'active' &&
      !currentPost.published;

    const query = this.db('posts').where('posts.id', '=', id);
    const rows = await query.update({
      title,
      content,
      headerImage,
      author,
      url,
      updatedBy: setUpdatedBy ? user_ref : undefined,
      updated: setUpdatedBy ? new Date() : undefined,
      status,
      published: shouldSetPublished ? new Date() : undefined,
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
      content ?? '',
      images ?? [],
      id,
      headerImage,
    );

    return await this.getPost(user_ref, id, false, opts);
  }

  async deletePost(id: number, permanently?: boolean): Promise<boolean> {
    if (permanently) {
      const rows = await this.db('posts').where('id', '=', id).delete();
      return rows > 0;
    }
    const rows = await this.db('posts').where('id', '=', id).update({
      status: 'deleted',
    });
    return rows > 0;
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

    await this.db
      .insert({
        author: user_ref,
        postId,
        score,
        timestamp: new Date(),
      })
      .into('post_votes');
    return true;
  }

  async getPostVote(
    user_ref: string,
    postId: number,
  ): Promise<RawPostVoteEntity | undefined> {
    return await this.db<RawPostVoteEntity>('post_votes')
      .where('author', '=', user_ref)
      .where('postId', '=', postId)
      .first();
  }

  async deletePostVote(user_ref: string, postId: number): Promise<boolean> {
    const rows = await this.db('post_votes')
      .where('author', '=', user_ref)
      .where('postId', '=', postId)
      .delete();
    return rows > 0;
  }

  async favoritePost(user_ref: string, postId: number): Promise<boolean> {
    await this.db
      .insert({
        user: user_ref,
        postId,
      })
      .into('user_favorite');
    return true;
  }

  async unfavoritePost(user_ref: string, postId: number): Promise<boolean> {
    await this.db('user_favorite')
      .where('user', user_ref)
      .where('postId', postId)
      .delete();
    return true;
  }

  async getUsersWhoFavoritedPost(postId: number): Promise<string[]> {
    const users = await this.db('user_favorite')
      .where('postId', postId)
      .select('user');
    return users.map(user => user.user);
  }

  private async mapPostEntities(
    rows: RawPostEntity[],
    user_ref: string,
    options?: PostOptions,
  ): Promise<Post[]> {
    if (rows.length === 0) {
      return [];
    }

    const postIds = rows.map(r => r.id);
    const {
      includeTags = true,
      includeAnswers = true,
      includeVotes = true,
      includeEntities = true,
      includeComments = true,
      includeAttachments = true,
      includeExperts = true,
    } = options ?? {};

    const [tags, votes, entities, comments, attachments, experts, answers] =
      await Promise.all([
        includeTags
          ? this.tagsStore.getRelatedTags(
              postIds,
              'post_tags',
              'postId',
              options?.tagsFilter,
            )
          : undefined,
        includeVotes
          ? this.db<RawPostVoteEntity>('post_votes')
              .whereIn('postId', postIds)
              .select()
          : undefined,
        includeEntities
          ? this.entitiesStore.getRelatedEntities(
              postIds,
              'post_entities',
              'postId',
            )
          : undefined,
        includeComments
          ? this.commentsStore.getPostComments(postIds, options?.commentsFilter)
          : undefined,
        includeAttachments
          ? this.attachmentsStore.getAttachments(postIds, 'postId')
          : undefined,
        includeExperts
          ? this.db('tag_experts')
              .leftJoin('post_tags', 'tag_experts.tagId', 'post_tags.tagId')
              .whereIn('post_tags.postId', postIds)
              .select('post_tags.postId', 'tag_experts.entityRef')
          : undefined,
        includeAnswers && this.answersStore
          ? this.answersStore.getPostAnswers(postIds, user_ref, {
              ...options,
              includePost: false,
              filter: options?.answersFilter,
            })
          : undefined,
      ]);

    const tagsMap = tags ?? new Map<number, string[]>();

    const votesMap = new Map<number, RawPostVoteEntity[]>();
    votes?.forEach((v: RawPostVoteEntity) => {
      const ps = votesMap.get(v.postId) || [];
      ps.push(v);
      votesMap.set(v.postId, ps);
    });

    const entitiesMap = entities ?? new Map<number, string[]>();

    const commentsMap = new Map<number, QetaComment[]>();
    (comments as unknown as (QetaComment & { postId: number })[])?.forEach(
      c => {
        const ps = commentsMap.get(c.postId) || [];
        ps.push(c);
        commentsMap.set(c.postId, ps);
      },
    );

    const attachmentsMap = attachments ?? new Map<number, number[]>();

    const expertsMap = new Map<number, string[]>();
    experts?.forEach((e: any) => {
      const ps = expertsMap.get(e.postId) || [];
      ps.push(e.entityRef);
      expertsMap.set(e.postId, ps);
    });

    const answersMap = new Map<number, Answer[]>();
    answers?.forEach((a: Answer) => {
      const ps = answersMap.get(a.postId) || [];
      ps.push(a);
      answersMap.set(a.postId, ps);
    });

    return rows.map(val => {
      const postVotes = votesMap.get(val.id) || [];
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
        status: val.status as PostStatus,
        score: this.mapToInteger(val.score),
        views: this.mapToInteger(val.views),
        answersCount: this.mapToInteger(val.answersCount),
        correctAnswer: this.mapToBoolean(val.correctAnswer),
        commentsCount: this.mapToInteger(val.commentsCount),
        favorite: this.mapToInteger(val.favorite) > 0,
        tags: tagsMap.get(val.id),
        answers: answersMap.get(val.id),
        votes: postVotes.map(v => ({
          author: v.author,
          score: v.score,
          timestamp: v.timestamp,
        })),
        entities: entitiesMap.get(val.id),
        trend: this.mapToInteger(val.trend),
        comments: commentsMap.get(val.id),
        ownVote: postVotes.find(v => v.author === user_ref)?.score,
        anonymous: val.anonymous,
        type: val.type,
        headerImage: val.headerImage,
        url: val.url ?? undefined,
        images: attachmentsMap.get(val.id),
        experts: expertsMap.get(val.id),
        published: val.published ? (val.published as Date) : undefined,
      };
    });
  }

  private getPostsBaseQuery(user: string, opts?: AnswerOptions) {
    const { includeStatusFilter = true } = opts ?? {};
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
    if (includeStatusFilter) {
      answersCount.where('answers.status', '=', 'active');
    }

    const correctAnswers = this.db('answers')
      .where('answers.postId', postRef)
      .where('answers.correct', '=', true)
      .count('*')
      .as('correctAnswers');
    if (includeStatusFilter) {
      correctAnswers.where('answers.status', '=', 'active');
    }

    const commentsCount = this.db('comments')
      .where('comments.postId', postRef)
      .count('*')
      .as('commentsCount');

    const favorite = this.db('user_favorite')
      .where('user_favorite.user', '=', user)
      .where('user_favorite.postId', postRef)
      .count('*')
      .as('favorite');

    return this.db<RawPostEntity>('posts')
      .select(
        'posts.*',
        score,
        views,
        answersCount,
        correctAnswers,
        commentsCount,
        favorite,
      )
      .leftJoin('post_votes', 'posts.id', 'post_votes.postId')
      .leftJoin('post_views', 'posts.id', 'post_views.postId')
      .leftJoin('answers', 'posts.id', 'answers.postId')
      .leftJoin('comments', 'posts.id', 'comments.postId')
      .leftJoin('user_favorite', 'posts.id', 'user_favorite.postId')
      .groupBy('posts.id');
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
      /* ...(await this.tagDatabase?.getTags()), */ // TODO
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

    const regex = /\w+:\w+\/\w+/;
    const entities =
      entitiesInput
        ?.filter(t => regex.test(t))
        .map(t => t.toLowerCase())
        .filter(t => t.length > 0) ?? [];

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
        [...new Set(newEntities)].map(async entityRef =>
          this.db
            .insert({ entity_ref: entityRef })
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
}
