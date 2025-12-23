import { BaseStore } from './BaseStore';
import { TimelineFilters } from '../QetaStore';
import {
  TimelineOptions,
  TimelineResponse,
} from '@drodil/backstage-plugin-qeta-common';

export class HelpersStore extends BaseStore {
  async getTimeline(
    _user_ref: string,
    options: TimelineOptions,
    filters?: TimelineFilters,
  ): Promise<TimelineResponse> {
    const limit = options.limit ?? 10;
    const offset = options.offset ?? 0;

    const collectionsQuery = this.db('collections').select(
      this.db.raw("'collection' as type"),
      'collections.id',
      'collections.owner as author',
      'collections.created as date',
      this.db.raw("'created' as action"),
      this.db.raw('CAST(null as TEXT) as content'),
      this.db.raw('CAST(null as INTEGER) as "postId"'),
      this.db.raw('CAST(null as INTEGER) as "answerId"'),
      'collections.headerImage',
      'collections.title',
      this.db.raw('CAST(null as TEXT) as "postTitle"'),
      this.db.raw('CAST(null as TEXT) as "postType"'),
    );
    if (filters?.collections) {
      this.parseFilter(
        filters.collections,
        collectionsQuery,
        this.db,
        'collection',
      );
    }

    const postsQuery = this.db('posts')
      .select(
        this.db.raw("'post' as type"),
        'id',
        'author',
        'created as date',
        this.db.raw("'created' as action"),
        'content',
        'id as postId',
        this.db.raw('CAST(null as INTEGER) as "answerId"'),
        'headerImage',
        'title',
        'title as postTitle',
        'type as postType',
      )
      .where('status', 'active');
    if (filters?.posts) {
      this.parseFilter(filters.posts, postsQuery, this.db, 'post');
    }

    const postsUpdateQuery = this.db('posts')
      .select(
        this.db.raw("'post' as type"),
        'id',
        'updatedBy as author',
        'updated as date',
        this.db.raw("'updated' as action"),
        'content',
        'id as postId',
        this.db.raw('CAST(null as INTEGER) as "answerId"'),
        'headerImage',
        'title',
        'title as postTitle',
        'type as postType',
      )
      .where('status', 'active')
      .whereNotNull('updated')
      .whereRaw('updated > created');
    if (filters?.posts) {
      this.parseFilter(filters.posts, postsUpdateQuery, this.db, 'post');
    }

    const answersQuery = this.db('answers')
      .leftJoin('posts', 'answers.postId', 'posts.id')
      .select(
        this.db.raw("'answer' as type"),
        'answers.id',
        'answers.author',
        'answers.created as date',
        this.db.raw("'created' as action"),
        'answers.content',
        'answers.postId',
        'answers.id as answerId',
        this.db.raw('CAST(null as TEXT) as "headerImage"'),
        this.db.raw('CAST(null as TEXT) as "title"'),
        'posts.title as postTitle',
        'posts.type as postType',
      )
      .where('posts.status', 'active');
    if (filters?.posts) {
      this.parseFilter(filters.posts, answersQuery, this.db, 'post');
    }
    if (filters?.answers) {
      this.parseFilter(filters.answers, answersQuery, this.db, 'answer');
    }

    const answersUpdateQuery = this.db('answers')
      .leftJoin('posts', 'answers.postId', 'posts.id')
      .select(
        this.db.raw("'answer' as type"),
        'answers.id',
        'answers.updatedBy as author',
        'answers.updated as date',
        this.db.raw("'updated' as action"),
        'answers.content',
        'answers.postId',
        'answers.id as answerId',
        this.db.raw('CAST(null as TEXT) as "headerImage"'),
        this.db.raw('CAST(null as TEXT) as "title"'),
        'posts.title as postTitle',
        'posts.type as postType',
      )
      .where('posts.status', 'active')
      .whereNotNull('answers.updated')
      .whereRaw('answers.updated > answers.created');
    if (filters?.posts) {
      this.parseFilter(filters.posts, answersUpdateQuery, this.db, 'post');
    }
    if (filters?.answers) {
      this.parseFilter(filters.answers, answersUpdateQuery, this.db, 'answer');
    }

    const commentsQuery = this.db('comments')
      .leftJoin('posts', 'comments.postId', 'posts.id')
      .leftJoin('answers', 'comments.answerId', 'answers.id')
      .leftJoin('posts as answerPosts', 'answers.postId', 'answerPosts.id')
      .select(
        this.db.raw("'comment' as type"),
        'comments.id',
        'comments.author',
        'comments.created as date',
        this.db.raw("'created' as action"),
        'comments.content',
        this.db.raw(
          'COALESCE("comments"."postId", "answers"."postId") as "postId"',
        ),
        'comments.answerId',
        this.db.raw('CAST(null as TEXT) as "headerImage"'),
        this.db.raw('CAST(null as TEXT) as "title"'),
        this.db.raw(
          'COALESCE("posts"."title", "answerPosts"."title") as "postTitle"',
        ),
        this.db.raw(
          'COALESCE("posts"."type", "answerPosts"."type") as "postType"',
        ),
      )
      .where(builder => {
        builder
          .where('posts.status', 'active')
          .orWhere('answerPosts.status', 'active');
      });
    if (filters?.comments) {
      this.parseFilter(filters.comments, commentsQuery, this.db, 'comments');
    }

    const unionQuery = this.db
      .union([
        postsQuery,
        postsUpdateQuery,
        answersQuery,
        answersUpdateQuery,
        commentsQuery,
        collectionsQuery,
      ])
      .orderBy('date', 'desc')
      .limit(limit)
      .offset(offset);

    const rows = await unionQuery;
    let total;

    if (options.includeTotal) {
      const subQuery = this.db.union([
        postsQuery.clone().clearSelect().select('id'),
        postsUpdateQuery.clone().clearSelect().select('id'),
        answersQuery.clone().clearSelect().select('answers.id'),
        answersUpdateQuery.clone().clearSelect().select('answers.id'),
        commentsQuery.clone().clearSelect().select('comments.id'),
        collectionsQuery.clone().clearSelect().select('collections.id'),
      ]);
      const totalResult = await this.db
        .count('* as total')
        .from(subQuery.as('t'));
      total = Number((totalResult[0] as any).total);
    }

    return {
      items: rows.map((row: any) => ({
        type: row.type,
        id: row.id,
        author: row.author,
        date: new Date(row.date),
        action: row.action,
        content: row.content,
        postId: row.postId,
        answerId: row.answerId,
        headerImage: row.headerImage,
        title: row.title,
        postTitle: row.postTitle,
        postType: row.postType,
      })),
      total,
    };
  }
}
