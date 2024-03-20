import express from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import {
  createLegacyAuthAdapters,
  errorHandler,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { qetaPermissions } from '@drodil/backstage-plugin-qeta-common';

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
  TokenManagerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { helperRoutes } from './routes/helpers';
import { SignalsService } from '@backstage/plugin-signals-node';

export interface RouterOptions {
  identity: IdentityApi;
  database: QetaStore;
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  tokenManager?: TokenManagerService;
  permissions?: PermissionsService;
  events?: EventsService;
  signals?: SignalsService;
  userInfo?: UserInfoService;
  httpAuth?: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const { logger } = options;
  const { userInfo, httpAuth } = createLegacyAuthAdapters(options);
  const routeOptions = {
    ...options,
    userInfo,
    httpAuth,
  };

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
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
