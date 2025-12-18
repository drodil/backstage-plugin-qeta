import { UserResponse, UsersResponse } from '../QetaStore';
import {
  UsersQuery,
  UserUsersResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Knex } from 'knex';
import { BaseStore } from './BaseStore';

export interface RawUserImpact {
  userRef: string;
  impact: number;
  date: Date;
}

export class UsersStore extends BaseStore {
  constructor(protected readonly db: Knex) {
    super(db);
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

    if (options?.searchQuery) {
      if (this.db.client.config.client === 'pg') {
        query.whereRaw('author % ?', [options.searchQuery]);
      } else {
        query.whereRaw('LOWER(author) LIKE LOWER(?)', [
          `%${options.searchQuery}%`,
        ]);
      }
    }

    const results = await Promise.all([
      query,
      this.db(totalQuery.as('totalQuery')).count('* as CNT').first(),
    ]);

    const rows = results[0];
    const total = this.mapToInteger((results[1] as any)?.CNT);

    return {
      users: rows.map((val: any) => {
        return {
          userRef: val.author,
          totalViews: this.mapToInteger(val.totalViews),
          totalQuestions: this.mapToInteger(val.totalQuestions),
          totalAnswers: this.mapToInteger(val.totalAnswers),
          totalComments: this.mapToInteger(val.comments),
          totalVotes:
            this.mapToInteger(val.answerVotes) +
            this.mapToInteger(val.postVotes),
          totalArticles: this.mapToInteger(val.totalArticles),
          totalFollowers: this.mapToInteger(val.totalFollowers),
          totalLinks: this.mapToInteger(val.totalLinks),
        };
      }),
      total,
    };
  }

  async getUsersCount(): Promise<number> {
    const res = await this.db('unique_authors').count('* as CNT').first();
    return this.mapToInteger(res?.CNT);
  }

  async getUser(user_ref: string): Promise<UserResponse | null> {
    const query = this.getUserBaseQuery();
    const rows = await query.where('author', user_ref);
    if (rows.length === 0) {
      return null;
    }
    const val = rows[0] as any;
    return {
      userRef: val.author,
      totalViews: this.mapToInteger(val.totalViews),
      totalQuestions: this.mapToInteger(val.totalQuestions),
      totalAnswers: this.mapToInteger(val.totalAnswers),
      totalComments: this.mapToInteger(val.comments),
      totalVotes:
        this.mapToInteger(val.answerVotes) + this.mapToInteger(val.postVotes),
      totalArticles: this.mapToInteger(val.totalArticles),
      totalFollowers: this.mapToInteger(val.totalFollowers),
      totalLinks: this.mapToInteger(val.totalLinks),
    };
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

  private getUserBaseQuery() {
    if (this.db.client.config.client !== 'pg') {
      // Subqueries do not work in sqlite so we just return all stats as empty, at least for now
      return this.db('posts')
        .select([
          'author',
          this.db.raw('0 as "totalViews"'),
          this.db.raw('0 as "totalQuestions"'),
          this.db.raw('0 as "totalArticles"'),
          this.db.raw('0 as "totalLinks"'),
          this.db.raw('0 as "totalAnswers"'),
          this.db.raw('0 as comments'),
          this.db.raw('0 as "answerVotes"'),
          this.db.raw('0 as "postVotes"'),
          this.db.raw('0 as "totalFollowers"'),
        ])
        .distinct();
    }

    const views = this.db('post_views')
      .select('author')
      .count('* as totalViews')
      .groupBy('author')
      .as('v');

    const questions = this.db('posts')
      .select('author')
      .where('type', 'question')
      .count('* as totalQuestions')
      .groupBy('author')
      .as('q');

    const articles = this.db('posts')
      .select('author')
      .where('type', 'article')
      .count('* as totalArticles')
      .groupBy('author')
      .as('ar');

    const links = this.db('posts')
      .select('author')
      .where('type', 'link')
      .count('* as totalLinks')
      .groupBy('author')
      .as('l');

    const answers = this.db('answers')
      .select('author')
      .count('* as totalAnswers')
      .groupBy('author')
      .as('a');

    const comments = this.db('comments')
      .select('author')
      .count('* as comments')
      .groupBy('author')
      .as('c');

    const aVotes = this.db('answer_votes')
      .select('author')
      .count('* as answerVotes')
      .groupBy('author')
      .as('av');

    const pVotes = this.db('post_votes')
      .select('author')
      .count('* as postVotes')
      .groupBy('author')
      .as('pv');

    const followers = this.db('user_users')
      .select('followedUserRef as author')
      .count('* as totalFollowers')
      .groupBy('followedUserRef')
      .as('f');

    return this.db('unique_authors')
      .leftJoin(views, 'unique_authors.author', 'v.author')
      .leftJoin(questions, 'unique_authors.author', 'q.author')
      .leftJoin(articles, 'unique_authors.author', 'ar.author')
      .leftJoin(links, 'unique_authors.author', 'l.author')
      .leftJoin(answers, 'unique_authors.author', 'a.author')
      .leftJoin(comments, 'unique_authors.author', 'c.author')
      .leftJoin(aVotes, 'unique_authors.author', 'av.author')
      .leftJoin(pVotes, 'unique_authors.author', 'pv.author')
      .leftJoin(followers, 'unique_authors.author', 'f.author')
      .select(
        'unique_authors.author',
        this.db.raw('COALESCE(v."totalViews", 0) as "totalViews"'),
        this.db.raw('COALESCE(q."totalQuestions", 0) as "totalQuestions"'),
        this.db.raw('COALESCE(ar."totalArticles", 0) as "totalArticles"'),
        this.db.raw('COALESCE(l."totalLinks", 0) as "totalLinks"'),
        this.db.raw('COALESCE(a."totalAnswers", 0) as "totalAnswers"'),
        this.db.raw('COALESCE(c.comments, 0) as comments'),
        this.db.raw('COALESCE(av."answerVotes", 0) as "answerVotes"'),
        this.db.raw('COALESCE(pv."postVotes", 0) as "postVotes"'),
        this.db.raw('COALESCE(f."totalFollowers", 0) as "totalFollowers"'),
      );
  }
}
