import { Router } from 'express';
import { getUsername, stringDateTime } from '../util';
import {
  Statistic,
  StatisticResponse,
  StatisticsOptions,
} from '@drodil/backstage-plugin-qeta-common';
import { RouteOptions } from '../types';

export const statisticRoutes = (router: Router, options: RouteOptions) => {
  const { database } = options;

  const getSummary = async (user_ref?: string) => {
    const results = await Promise.all([
      database.getCount('posts', user_ref),
      database.getCount('answers', user_ref),
      user_ref
        ? database.getTotalViews(user_ref)
        : database.getCount('post_views'),
      database.getCount('post_comments', user_ref),
      database.getCount('answer_comments', user_ref),
      database.getCount('post_votes', user_ref),
      database.getCount('answer_votes', user_ref),
    ]);
    return {
      totalQuestions: results[0],
      totalAnswers: results[1],
      totalViews: results[2],
      totalComments: results[3] + results[4],
      totalVotes: results[5] + results[6],
    };
  };

  router.get('/statistics/user/impact', async (request, response) => {
    const userRef = await getUsername(request, options);
    const userImpact = await database.getTotalViews(userRef);
    const userImpactWeek = await database.getTotalViews(userRef, 7);
    return response
      .status(200)
      .json({ impact: userImpact, lastWeekImpact: userImpactWeek });
  });

  router.get('/statistics/global', async (_req, response) => {
    const globalStats = await database.getGlobalStats();
    const summary = await getSummary();
    return response.status(200).json({ statistics: globalStats, summary });
  });

  router.get('/statistics/user/:userRef(*)', async (req, response) => {
    const userRef = req.params.userRef;
    const userStats = await database.getUserStats(userRef);
    const summary = await getSummary(userRef);
    return response.status(200).json({ statistics: userStats, summary });
  });

  // GET /statistics/questions/top-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/questions/top-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await getUsername(request, options);

      const statsOptions: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
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
      const userRef = await getUsername(request, options);

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
      const userRef = await getUsername(request, options);

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

  // GET /statistics/questions/most-questions?period=x&limit=x
  router.get(
    '/statistics/questions/most-questions',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await getUsername(request, options);

      const statsOptions: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
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
    },
  );

  // GET /statistics/answers/most-answers?period=x&limit=x
  router.get('/statistics/answers/most-answers', async (request, response) => {
    const { period, limit } = request.query;
    const userRef = await getUsername(request, options);

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
