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
          this.db.raw('0 as totalViews'),
          this.db.raw('0 as totalQuestions'),
          this.db.raw('0 as totalArticles'),
          this.db.raw('0 as totalLinks'),
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

    const links = this.db('posts')
      .where('posts.author', authorRef)
      .where('posts.type', 'link')
      .count('*')
      .as('totalLinks');

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
      links,
      comments,
      pVotes,
      aVotes,
      followers,
    );
  }
}
