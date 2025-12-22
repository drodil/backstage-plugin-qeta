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
      let orderBy: string = options.orderBy;
      if (orderBy === 'userRef') {
        orderBy =
          this.db.client.config.client === 'pg'
            ? 'unique_authors.author'
            : 'author';
      }
      query.orderBy(orderBy as any, options?.order || 'desc');
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
          totalComments: this.mapToInteger(val.totalComments),
          totalVotes: this.mapToInteger(val.totalVotes),
          totalArticles: this.mapToInteger(val.totalArticles),
          totalFollowers: this.mapToInteger(val.followerCount),
          totalLinks: this.mapToInteger(val.totalLinks),
          reputation: this.mapToInteger(val.reputation),
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
    const rows = await query.where('unique_authors.author', user_ref);
    if (rows.length === 0) {
      return null;
    }
    const val = rows[0] as any;
    return {
      userRef: val.author,
      totalViews: this.mapToInteger(val.totalViews),
      totalQuestions: this.mapToInteger(val.totalQuestions),
      totalAnswers: this.mapToInteger(val.totalAnswers),
      totalComments: this.mapToInteger(val.totalComments),
      totalVotes: this.mapToInteger(val.totalVotes),
      totalArticles: this.mapToInteger(val.totalArticles),
      totalFollowers: this.mapToInteger(val.followerCount),
      totalLinks: this.mapToInteger(val.totalLinks),
      reputation: this.mapToInteger(val.reputation),
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
          this.db.raw('0 as "totalComments"'),
          this.db.raw('0 as "answerVotes"'),
          this.db.raw('0 as "postVotes"'),
          this.db.raw('0 as "totalVotes"'),
          this.db.raw('0 as "totalPosts"'),
          this.db.raw('0 as "followerCount"'),
          this.db.raw('0 as "reputation"'),
        ])
        .distinct();
    }

    return this.db('user_stats_view')
      .join(
        'unique_authors',
        'unique_authors.author',
        'user_stats_view.userRef',
      )
      .select(
        'unique_authors.author',
        'user_stats_view.totalViews',
        'user_stats_view.totalQuestions',
        'user_stats_view.totalArticles',
        'user_stats_view.totalLinks',
        'user_stats_view.totalAnswers',
        'user_stats_view.totalComments',
        'user_stats_view.answerVotes',
        'user_stats_view.postVotes',
        'user_stats_view.totalVotes',
        'user_stats_view.totalPosts',
        'user_stats_view.totalFollowers as followerCount',
        'user_stats_view.reputation',
      );
  }
}
