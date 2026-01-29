import { Router } from 'express';
import { stringDateTime } from '../util';
import { getCachedData } from './routeUtil';
import {
  Statistic,
  StatisticResponse,
  StatisticsOptions,
} from '@drodil/backstage-plugin-qeta-common';
import { RouteOptions } from '../types';

export const statisticRoutes = (router: Router, options: RouteOptions) => {
  const { database, permissionMgr } = options;

  const getSummary = async (user_ref?: string) => {
    const results = await Promise.all([
      database.getCount('posts', { author: user_ref, type: 'question' }),
      database.getCount('answers', { author: user_ref }),
      user_ref
        ? database.getTotalViews(user_ref)
        : database.getCount('post_views'),
      database.getCount('comments', { author: user_ref }),
      database.getCount('post_votes', { author: user_ref }),
      database.getCount('answer_votes', { author: user_ref }),
      database.getCount('posts', { author: user_ref, type: 'article' }),
      !user_ref ? database.getUsersCount() : undefined,
      !user_ref ? database.getCount('tags') : undefined,
      database.getCount('posts', { author: user_ref, type: 'link' }),
    ]);
    return {
      totalQuestions: results[0],
      totalAnswers: results[1],
      totalViews: results[2],
      totalComments: results[3],
      totalVotes: results[4] + results[5],
      totalArticles: results[6],
      totalUsers: results[7],
      totalTags: results[8],
      totalLinks: results[9],
    };
  };

  router.get('/statistics/user/impact', async (request, response) => {
    const userRef = await permissionMgr.getUsername(request);
    const key = `qeta:statistics:impact:${userRef}`;
    const ttl = 300 * 1000;

    const impact = await getCachedData(
      options.cache,
      key,
      ttl,
      async () => {
        const userImpact = await database.getTotalViews(
          userRef,
          undefined,
          true,
        );
        const userImpactWeek = await database.getTotalViews(userRef, 7, true);
        return { impact: userImpact, lastWeekImpact: userImpactWeek };
      },
      options.logger,
    );

    return response.status(200).json(impact);
  });

  router.get('/statistics/global', async (_req, response) => {
    const key = 'qeta:statistics:global';
    const ttl = 3600 * 1000;

    const data = await getCachedData(
      options.cache,
      key,
      ttl,
      async () => {
        const globalStats = await database.getGlobalStats();
        let summary = await getSummary();
        if (!summary) {
          summary = {
            totalAnswers: 0,
            totalArticles: 0,
            totalLinks: 0,
            totalComments: 0,
            totalQuestions: 0,
            totalViews: 0,
            totalVotes: 0,
            totalTags: 0,
            totalUsers: 0,
          };
        }
        let todayStatsAdded = false;
        const statistics = globalStats.map(g => {
          const d = new Date(g.date);
          if (d.toDateString() !== new Date().toDateString()) {
            return g;
          }
          todayStatsAdded = true;
          return {
            date: d,
            ...summary!,
          };
        });

        if (!todayStatsAdded) {
          statistics.push({ date: new Date(), ...summary! });
        }
        return { statistics, summary };
      },
      options.logger,
    );
    return response.json(data);
  });

  router.get('/statistics/activity', async (req, response) => {
    const period = (req.query.period as string) || '3600'; // Default 1 hour
    const activity = await database.getCommunityActivity(period);
    return response.json(activity);
  });

  router.get('/statistics/user/:userRef(*)', async (req, response) => {
    const userRef = req.params.userRef;
    const key = `qeta:statistics:user:${userRef}`;
    const ttl = 3600 * 1000;

    const data = await getCachedData(
      options.cache,
      key,
      ttl,
      async () => {
        const userStats = await database.getUserStats(userRef);
        let summary = await database.getUser(userRef);
        let todayStatsAdded = false;
        const statistics = userStats.map(g => {
          const d = new Date(g.date);
          if (!summary || d.toDateString() !== new Date().toDateString()) {
            return g;
          }
          todayStatsAdded = true;
          return {
            date: d,
            ...summary,
          };
        });

        if (!todayStatsAdded) {
          if (!summary) {
            summary = {
              userRef: userRef,
              totalViews: 0,
              totalQuestions: 0,
              totalAnswers: 0,
              totalComments: 0,
              totalVotes: 0,
              totalArticles: 0,
              totalFollowers: 0,
              totalLinks: 0,
              reputation: 0,
              answerScore: 0,
              postScore: 0,
              correctAnswers: 0,
            };
          }

          if (userStats.length === 0) {
            statistics.push({ date: new Date(), ...summary });
          }
        }
        return { statistics, summary };
      },
      options.logger,
    );

    return response.status(200).json(data);
  });

  // GET /statistics/posts/top-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/posts/top-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await permissionMgr.getUsername(request);

      const statsOptions: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
        type: 'question',
      };

      const mostUpvotedQuestions: Statistic[] =
        await database.getMostUpvotedPosts({
          options: statsOptions,
        });

      const rankingResponse = {
        ranking: mostUpvotedQuestions,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedQuestions.find(userStats => {
        return userStats.author === userRef;
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedQuestions = await database.getMostUpvotedPosts({
          author: userRef,
          options: statsOptions,
        });

        if (loggedUserUpvotedQuestions) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedQuestions.length > 0
              ? loggedUserUpvotedQuestions[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedQuestions.length > 0
              ? loggedUserUpvotedQuestions[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedQuestions.length === 1
              ? 0
              : mostUpvotedQuestions.length + 1;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  // GET /statistics/answers/top-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/answers/top-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await permissionMgr.getUsername(request);

      const statsOptions: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
      };

      const mostUpvotedAnswers: Statistic[] =
        await database.getMostUpvotedAnswers({
          options: statsOptions,
        });

      const rankingResponse = {
        ranking: mostUpvotedAnswers,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedAnswers.find(userStats => {
        return userStats.author === userRef;
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedAnswers = await database.getMostUpvotedAnswers({
          author: userRef,
          options: statsOptions,
        });

        if (loggedUserUpvotedAnswers) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedAnswers.length > 0
              ? loggedUserUpvotedAnswers[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedAnswers.length > 0
              ? loggedUserUpvotedAnswers[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedAnswers.length === 1 ? 0 : mostUpvotedAnswers.length + 1;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  // GET /statistics/answers/top-correct-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/answers/top-correct-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await permissionMgr.getUsername(request);

      const statsOptions: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
      };

      const mostUpvotedCorrectAnswers: Statistic[] =
        await database.getMostUpvotedCorrectAnswers({
          options: statsOptions,
        });

      const rankingResponse = {
        ranking: mostUpvotedCorrectAnswers,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedCorrectAnswers.find(userStats => {
        return userStats.author === userRef;
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedCorrectAnswers =
          await database.getMostUpvotedCorrectAnswers({
            author: userRef,
            options: statsOptions,
          });

        if (loggedUserUpvotedCorrectAnswers) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedCorrectAnswers.length > 0
              ? loggedUserUpvotedCorrectAnswers[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedCorrectAnswers.length > 0
              ? loggedUserUpvotedCorrectAnswers[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedCorrectAnswers.length === 1
              ? 0
              : mostUpvotedCorrectAnswers.length + 1;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  // GET /statistics/posts/most-questions?period=x&limit=x
  router.get('/statistics/posts/most-questions', async (request, response) => {
    const { period, limit } = request.query;
    const userRef = await permissionMgr.getUsername(request);

    const statsOptions: StatisticsOptions = {
      period: period && stringDateTime(period?.toString()),
      limit: Number(limit),
      type: 'question',
    };

    const mostQuestions: Statistic[] = await database.getTotalPosts({
      options: statsOptions,
    });

    const rankingResponse = {
      ranking: mostQuestions,
      loggedUser: {},
    } as StatisticResponse;

    const findLoggerUserInData = mostQuestions.find(userStats => {
      return userStats.author === userRef;
    });

    if (!findLoggerUserInData) {
      const loggedUserQuestions = await database.getTotalPosts({
        author: userRef,
        options: statsOptions,
      });

      if (loggedUserQuestions) {
        rankingResponse.loggedUser!.author =
          loggedUserQuestions.length > 0
            ? loggedUserQuestions[0].author
            : userRef;

        rankingResponse.loggedUser!.total =
          loggedUserQuestions.length > 0 ? loggedUserQuestions[0].total : 0;

        rankingResponse.loggedUser!.position =
          mostQuestions.length === 1 ? 0 : mostQuestions.length + 1;
      }
    } else {
      rankingResponse.loggedUser = findLoggerUserInData;
    }

    return response.status(200).json(rankingResponse);
  });

  // GET /statistics/answers/most-answers?period=x&limit=x
  router.get('/statistics/answers/most-answers', async (request, response) => {
    const { period, limit } = request.query;
    const userRef = await permissionMgr.getUsername(request);

    const statsOptions: StatisticsOptions = {
      period: period && stringDateTime(period?.toString()),
      limit: Number(limit),
    };

    const mostAnswers: Statistic[] = await database.getTotalAnswers({
      options: statsOptions,
    });

    const rankingResponse = {
      ranking: mostAnswers,
      loggedUser: {},
    } as StatisticResponse;

    const findLoggerUserInData = mostAnswers.find(userStats => {
      return userStats.author === userRef;
    });

    if (!findLoggerUserInData) {
      const loggedUserQuestions = await database.getTotalAnswers({
        author: userRef,
        options: statsOptions,
      });

      if (loggedUserQuestions) {
        rankingResponse.loggedUser!.author =
          loggedUserQuestions.length > 0
            ? loggedUserQuestions[0].author
            : userRef;

        rankingResponse.loggedUser!.total =
          loggedUserQuestions.length > 0 ? loggedUserQuestions[0].total : 0;

        rankingResponse.loggedUser!.position =
          mostAnswers.length === 1 ? 0 : mostAnswers.length + 1;
      }
    } else {
      rankingResponse.loggedUser = findLoggerUserInData;
    }

    return response.status(200).json(rankingResponse);
  });
};
