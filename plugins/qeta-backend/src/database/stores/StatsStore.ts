import {
  GlobalStat,
  PostType,
  Statistic,
  StatisticsRequestParameters,
  UserStat,
  CommunityStats,
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

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activeUsers = await this.db.raw(
      `
      SELECT COUNT(DISTINCT "user") as "CNT" FROM (
        SELECT author as "user" FROM posts WHERE created BETWEEN ? AND ?
        UNION
        SELECT author as "user" FROM answers WHERE created BETWEEN ? AND ?
        UNION
        SELECT author as "user" FROM comments WHERE created BETWEEN ? AND ?
        UNION
        SELECT author as "user" FROM post_votes WHERE timestamp BETWEEN ? AND ?
        UNION
        SELECT author as "user" FROM post_views WHERE timestamp BETWEEN ? AND ?
      ) as active_users
    `,
      [
        startOfDay,
        endOfDay,
        startOfDay,
        endOfDay,
        startOfDay,
        endOfDay,
        startOfDay,
        endOfDay,
        startOfDay,
        endOfDay,
      ],
    );

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
        activeUsers: this.mapToInteger(
          activeUsers.rows ? activeUsers.rows[0].CNT : activeUsers[0]?.CNT,
        ),
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
        answerScore: userStats.answerScore || 0,
        postScore: userStats.postScore || 0,
        correctAnswers: userStats.correctAnswers || 0,
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
  async getCommunityActivity(period: string): Promise<CommunityStats> {
    // Parse period string like "7d", "30d", "90d", "1y" to milliseconds
    let periodMs: number;
    if (period.endsWith('d')) {
      periodMs = parseInt(period.slice(0, -1), 10) * 24 * 60 * 60 * 1000;
    } else if (period.endsWith('y')) {
      periodMs = parseInt(period.slice(0, -1), 10) * 365 * 24 * 60 * 60 * 1000;
    } else {
      periodMs = parseInt(period, 10);
    }
    const periodDate = new Date(Date.now() - periodMs);

    const [posts, answers, comments, votes, views, users] = await Promise.all([
      this.db('posts')
        .count('id as CNT')
        .where('created', '>=', periodDate)
        .first(),
      this.db('answers')
        .count('id as CNT')
        .where('created', '>=', periodDate)
        .first(),
      this.db('comments')
        .count('id as CNT')
        .where('created', '>=', periodDate)
        .first(),
      this.db('post_votes')
        .count('postId as CNT')
        .where('timestamp', '>=', periodDate)
        .first(),
      this.db('post_views')
        .count('postId as CNT')
        .where('timestamp', '>=', periodDate)
        .first(),
      this.db.raw(
        `
        SELECT COUNT(DISTINCT "user") as "CNT" FROM (
          SELECT author as "user" FROM posts WHERE created >= ?
          UNION
          SELECT author as "user" FROM answers WHERE created >= ?
          UNION
          SELECT author as "user" FROM comments WHERE created >= ?
          UNION
          SELECT author as "user" FROM post_votes WHERE timestamp >= ?
          UNION
          SELECT author as "user" FROM post_views WHERE timestamp >= ?
        ) as active_users
      `,
        [periodDate, periodDate, periodDate, periodDate, periodDate],
      ),
    ]);

    return {
      period,
      posts: this.mapToInteger(posts?.CNT),
      answers: this.mapToInteger(answers?.CNT),
      comments: this.mapToInteger(comments?.CNT),
      votes: this.mapToInteger(votes?.CNT),
      views: this.mapToInteger(views?.CNT),
      activeUsers: this.mapToInteger(
        users.rows ? users.rows[0].CNT : users[0]?.CNT,
      ),
    };
  }
}
