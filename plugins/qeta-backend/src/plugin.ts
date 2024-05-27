import { getRootLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseQetaStore } from './database/DatabaseQetaStore';
import { signalsServiceRef } from '@backstage/plugin-signals-node';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { notificationService } from '@backstage/plugin-notifications-node';

const logger = getRootLogger();

/**
 * Qeta backend plugin
 *
 * @public
 */
export const qetaPlugin = createBackendPlugin({
  pluginId: 'qeta',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        events: eventsServiceRef,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        signals: signalsServiceRef,
        notifications: notificationService,
      },
      async init({
        config,
        httpRouter,
        database,
        events,
        discovery,
        permissions,
        httpAuth,
        userInfo,
        signals,
        notifications,
      }) {
        const qetaStore = await DatabaseQetaStore.create({
          database,
        });

        httpRouter.use(
          await createRouter({
            config,
            logger,
            events,
            database: qetaStore,
            discovery,
            permissions,
            httpAuth,
            userInfo,
            signals,
            notifications,
          }),
        );
        // Allowing attachments download
        httpRouter.addAuthPolicy({
          allow: 'unauthenticated',
          path: '/attachments',
        });
      },
    });
  },
});
