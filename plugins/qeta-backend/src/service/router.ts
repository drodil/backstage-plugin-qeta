import express from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { qetaPermissions } from '@drodil/backstage-plugin-qeta-common';

import { QetaStore } from '../database/QetaStore';
import { statisticRoutes } from './routes/statistics';
import { questionsRoutes } from './routes/questions';
import { attachmentsRoutes } from './routes/attachments';
import { answersRoutes } from './routes/answers';
import { EventBroker } from '@backstage/plugin-events-node';
import {
  LoggerService,
  TokenManagerService,
} from '@backstage/backend-plugin-api';
import { helperRoutes } from './routes/helpers';
import { SignalService } from '@backstage/plugin-signals-node';

export interface RouterOptions {
  identity: IdentityApi;
  database: QetaStore;
  logger: LoggerService;
  config: Config;
  tokenManager?: TokenManagerService;
  permissions?: PermissionEvaluator;
  eventBroker?: EventBroker;
  signalService?: SignalService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const { logger } = options;

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.use(permissionIntegrationRouter);

  questionsRoutes(router, options);
  answersRoutes(router, options);
  helperRoutes(router, options);
  attachmentsRoutes(router, options);
  statisticRoutes(router, options);

  router.use(errorHandler());
  return router;
}
