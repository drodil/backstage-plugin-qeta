import { loadBackendConfig, useHotMemoize } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseQetaStore } from './database/DatabaseQetaStore';
import Knex from 'knex';
import { getRootLogger } from '@backstage/backend-common';

/**
 * Qeta backend plugin
 *
 * @public
 */

const logger = getRootLogger();

export const qetaPlugin = createBackendPlugin({
  pluginId: 'qeta',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        identity: coreServices.identity,
      },
      async init({ config, httpRouter, identity }) {
        const configs = await loadBackendConfig({ logger, argv: process.argv });

        const getDatabase = useHotMemoize(module, () => {
          return Knex(configs.get('backend.database'));
        });

        const database = await DatabaseQetaStore.create({
          database: { getClient: async () => getDatabase },
        });

        httpRouter.use(
          await createRouter({
            config,
            logger,
            identity,
            database,
          }),
        );
      },
    });
  },
});
