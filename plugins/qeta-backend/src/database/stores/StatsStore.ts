import {
  GlobalStat,
  PostType,
  Statistic,
  StatisticsRequestParameters,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import { Knex } from 'knex';
import { BaseStore } from './BaseStore';

export class StatsStore extends BaseStore {
  constructor(protected readonly db: Knex) {
    super(db);
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
      .where(builder =>
        builder.where('anonymous', '!=', true).orWhereNull('anonymous'),
      );

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
      .where(builder =>
        builder.where('q.anonymous', '!=', true).orWhereNull('q.anonymous'),
      );

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
      .where(builder =>
        builder.where('a.anonymous', '!=', true).orWhereNull('a.anonymous'),
      );

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
      .where('a.correct', '=', true)
      .groupBy('a.author')
      .orderBy('total', 'desc')
      .where(builder =>
        builder.where('a.anonymous', '!=', true).orWhereNull('a.anonymous'),
      );

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
      .where(builder =>
        builder.where('a.anonymous', '!=', true).orWhereNull('a.anonymous'),
      );

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

  async getCount(
    table: string,
    filters?: { author?: string; type?: PostType },
  ): Promise<number> {
    const query = this.db(table).count('* as CNT');
    if (filters?.author) {
      query.where('author', '=', filters.author);
    }
    if (filters?.type) {
      query.where('type', '=', filters.type);
    }

    const res = await query.first();
    return this.mapToInteger(res?.CNT);
  }

  async saveGlobalStats(date: Date): Promise<void> {
    const globalStats = await this.db('global_stats_view').select('*').first();

    await this.db
      .insert({
        date: date,
        totalQuestions: globalStats.totalQuestions || 0,
        totalAnswers: globalStats.totalAnswers || 0,
        totalArticles: globalStats.totalArticles || 0,
        totalUsers: globalStats.totalUsers || 0,
        totalViews: globalStats.totalViews || 0,
        totalVotes: globalStats.totalVotes || 0,
        totalTags: globalStats.totalTags || 0,
        totalComments: globalStats.totalComments || 0,
      })
      .into('global_stats')
      .onConflict('date')
      .merge();
  }

  async saveUserStats(userRef: string, date: Date): Promise<void> {
    const userStats = await this.db('user_stats_view')
      .where('userRef', userRef)
      .select('*')
      .first();

    if (!userStats) {
      return;
    }

    await this.db
      .insert({
        userRef: userRef,
        date: date,
        totalQuestions: userStats.totalQuestions || 0,
        totalAnswers: userStats.totalAnswers || 0,
        totalArticles: userStats.totalArticles || 0,
        totalViews: userStats.totalViews || 0,
        totalVotes: userStats.totalVotes || 0,
        totalComments: userStats.totalComments || 0,
        reputation: userStats.reputation || 0,
      })
      .into('user_stats')
      .onConflict(['userRef', 'date'])
      .merge();
  }

  async getUsersCount(): Promise<number> {
    const res = await this.db('unique_authors').count('* as CNT').first();
    return this.mapToInteger(res?.CNT);
  }

  async getTotalViews(
    user_ref: string,
    lastDays?: number,
    excludeUser?: boolean,
  ): Promise<number> {
    const query = this.db('post_views')
      .join('posts', 'post_views.postId', 'posts.id')
      .where('posts.author', '=', user_ref)
      .count('* as CNT');

    if (excludeUser) {
      query.where('post_views.author', '!=', user_ref);
    }

    if (lastDays) {
      const date = new Date();
      date.setDate(date.getDate() - lastDays);
      query.where('post_views.timestamp', '>', date);
    }

    const res = await query.first();
    return this.mapToInteger(res?.CNT);
  }

  async cleanStats(days: number, date: Date): Promise<void> {
    const cleanDate = new Date(date);
    cleanDate.setDate(cleanDate.getDate() - days);
    await this.db('global_stats').where('date', '<', cleanDate).delete();
    await this.db('user_stats').where('date', '<', cleanDate).delete();
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
}
