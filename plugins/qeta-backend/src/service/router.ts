import express from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  Comment,
  COMMENT_RESOURCE_TYPE,
  qetaPermissions,
  Question,
  QUESTION_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import { statisticRoutes } from './routes/statistics';
import { questionsRoutes } from './routes/questions';
import { attachmentsRoutes } from './routes/attachments';
import { answersRoutes } from './routes/answers';
import { helperRoutes } from './routes/helpers';
import { RouterOptions } from './types';
import { NotificationManager } from './NotificationManager';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { answerRules, commentRules, questionRules } from './questionRules';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const { config, logger, httpAuth } = options;
  const notificationMgr = new NotificationManager(
    logger,
    options.notifications,
  );
  const routeOptions = {
    ...options,
    httpAuth,
    notificationMgr,
  };

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
    resources: [
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              const question = await options.database.getQuestion(
                '',
                Number.parseInt(ref, 10),
                false,
              );
              return question === null ? undefined : (question as Question);
            }),
          );
        },
        resourceType: QUESTION_RESOURCE_TYPE,
        rules: Object.values(questionRules),
      },
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              const answer = await options.database.getAnswer(
                Number.parseInt(ref, 10),
                '',
              );
              return answer === null ? undefined : (answer as Answer);
            }),
          );
        },
        resourceType: ANSWER_RESOURCE_TYPE,
        rules: Object.values(answerRules),
      },
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              const comment =
                (await options.database.getAnswerComment(
                  Number.parseInt(ref, 10),
                )) ??
                (await options.database.getQuestionComment(
                  Number.parseInt(ref, 10),
                ));
              return comment === null ? undefined : (comment as Comment);
            }),
          );
        },
        resourceType: COMMENT_RESOURCE_TYPE,
        rules: Object.values(commentRules),
      },
    ],
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.use(permissionIntegrationRouter);

  questionsRoutes(router, routeOptions);
  answersRoutes(router, routeOptions);
  helperRoutes(router, routeOptions);
  attachmentsRoutes(router, routeOptions);
  statisticRoutes(router, routeOptions);

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
