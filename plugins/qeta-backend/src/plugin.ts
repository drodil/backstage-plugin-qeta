import { getRootLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseQetaStore } from './database/DatabaseQetaStore';
import { signalsServiceRef } from '@backstage/plugin-signals-node';

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
        tokenManager: coreServices.tokenManager,
        signals: signalsServiceRef,
      },
      async init({
        config,
        httpRouter,
        identity,
        database,
        tokenManager,
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
            database: qetaStore,
            tokenManager,
            signals: signals,
          }),
        );
      },
    });
  },
});
