import { Router } from 'express';
import { getUsername, stringDateTime } from '../util';
import {
  Statistic,
  StatisticResponse,
  StatisticsOptions,
} from '@drodil/backstage-plugin-qeta-common';
import { RouterOptions } from '../router';

export const statisticRoutes = (router: Router, options: RouterOptions) => {
  const { database } = options;

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
        await database.getMostUpvotedQuestions({
          options: statsOptions,
        });

      const rankingResponse = {
        ranking: mostUpvotedQuestions,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedQuestions.find(userStats => {
        return userStats.author?.includes(userRef);
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedQuestions =
          await database.getMostUpvotedQuestions({
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
            mostUpvotedQuestions.length === 1 ? 0 : mostUpvotedQuestions.length;
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
        return userStats.author?.includes(userRef);
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
            mostUpvotedAnswers.length === 1 ? 0 : mostUpvotedAnswers.length;
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
        return userStats.author?.includes(userRef);
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
              : mostUpvotedCorrectAnswers.length;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );
};
