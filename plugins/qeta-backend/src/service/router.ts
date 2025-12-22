import express from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import { statisticRoutes } from './routes/statistics';
import { attachmentsRoutes } from './routes/attachments';
import { answersRoutes } from './routes/answers';
import { helperRoutes } from './routes/helpers';
import { RouterOptions } from './types';
import { NotificationManager } from './NotificationManager';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { postsRoutes } from './routes/posts';
import { collectionsRoutes } from './routes/collections';
import { templateRoutes } from './routes/templates';
import { aiRoutes } from './routes/ai';
import { suggestionRoutes } from './routes/suggestions';
import { permissionsRoute } from './routes/permissions';
import { badgesRoutes } from './routes/badges';
import { PermissionManager } from './PermissionManager.ts';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const { config, logger, httpAuth } = options;
  const notificationMgr = new NotificationManager(
    logger,
    options.catalog,
    options.auth,
    config,
    options.notifications,
    options.cache,
    options.notificationReceivers,
  );

  const permissionMgr = new PermissionManager(
    config,
    options.auth,
    options.httpAuth,
    options.userInfo,
    options.permissions,
    options.auditor,
  );

  const routeOptions = {
    ...options,
    httpAuth,
    notificationMgr,
    permissionMgr,
  };

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  permissionsRoute(router, routeOptions);
  postsRoutes(router, routeOptions);
  answersRoutes(router, routeOptions);
  helperRoutes(router, routeOptions);
  attachmentsRoutes(router, routeOptions);
  statisticRoutes(router, routeOptions);
  collectionsRoutes(router, routeOptions);
  templateRoutes(router, routeOptions);
  aiRoutes(router, routeOptions);
  suggestionRoutes(router, routeOptions);
  badgesRoutes(router, routeOptions);

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
