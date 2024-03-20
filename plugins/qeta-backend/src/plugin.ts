import { getRootLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseQetaStore } from './database/DatabaseQetaStore';
import { signalsServiceRef } from '@backstage/plugin-signals-node';
import { eventsServiceRef } from '@backstage/plugin-events-node';

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
        identity: coreServices.identity,
        database: coreServices.database,
        events: eventsServiceRef,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        tokenManager: coreServices.tokenManager,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        signals: signalsServiceRef,
      },
      async init({
        config,
        httpRouter,
        identity,
        database,
        events,
        discovery,
        permissions,
        tokenManager,
        httpAuth,
        userInfo,
        signals,
      }) {
        const qetaStore = await DatabaseQetaStore.create({
          database,
        });

        httpRouter.use(
          await createRouter({
            config,
            logger,
            identity,
            events,
            database: qetaStore,
            discovery,
            permissions,
            tokenManager,
            httpAuth,
            userInfo,
            signals: signals,
          }),
        );
      },
    });
  },
});
