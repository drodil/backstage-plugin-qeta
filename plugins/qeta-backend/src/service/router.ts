import express from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  qetaPermissions,
  Question,
  QUESTION_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';

import { QetaStore } from '../database/QetaStore';
import { statisticRoutes } from './routes/statistics';
import { questionsRoutes } from './routes/questions';
import { attachmentsRoutes } from './routes/attachments';
import { answersRoutes } from './routes/answers';
import { EventsService } from '@backstage/plugin-events-node';
import {
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { helperRoutes } from './routes/helpers';
import { SignalsService } from '@backstage/plugin-signals-node';
import { questionRules } from './questionRules';

export interface RouterOptions {
  database: QetaStore;
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  permissions?: PermissionsService;
  events?: EventsService;
  signals?: SignalsService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const { logger, httpAuth } = options;
  const routeOptions = {
    ...options,
    httpAuth,
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

  router.use(errorHandler());
  return router;
}
