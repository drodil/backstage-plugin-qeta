import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseQetaStore } from './database';
import { signalsServiceRef } from '@backstage/plugin-signals-node';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { notificationService } from '@backstage/plugin-notifications-node';
import { StatsCollector } from './service/StatsCollector';
import { TagsUpdater } from './service/TagsUpdater';
import { AttachmentCleaner } from './service/AttachmentCleaner';
import { CatalogClient } from '@backstage/catalog-client';
import {
  AIHandler,
  qetaAIExtensionPoint,
  QetaAIExtensionPoint,
} from '@drodil/backstage-plugin-qeta-node';

class QetaAIExtensionPointImpl implements QetaAIExtensionPoint {
  #aiHandler?: AIHandler;

  get aiHandler() {
    return this.#aiHandler;
  }

  setAIHandler(handler: AIHandler) {
    this.#aiHandler = handler;
  }
}

/**
 * Qeta backend plugin
 *
 * @public
 */
export const qetaPlugin = createBackendPlugin({
  pluginId: 'qeta',
  register(env) {
    const aiExtension = new QetaAIExtensionPointImpl();
    env.registerExtensionPoint(qetaAIExtensionPoint, aiExtension);

    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        events: eventsServiceRef,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        scheduler: coreServices.scheduler,
        signals: signalsServiceRef,
        notifications: notificationService,
        auth: coreServices.auth,
        cache: coreServices.cache,
      },
      async init({
        logger,
        config,
        httpRouter,
        database,
        events,
        discovery,
        permissions,
        httpAuth,
        userInfo,
        scheduler,
        signals,
        notifications,
        auth,
        cache,
      }) {
        const qetaStore = await DatabaseQetaStore.create({
          database,
        });
        const permissionEnabled =
          (config.getOptionalBoolean('permission.enabled') ?? false) &&
          (config.getOptionalBoolean('qeta.permissions') ?? false);

        const catalog = new CatalogClient({ discoveryApi: discovery });

        httpRouter.use(
          await createRouter({
            config,
            logger,
            events,
            database: qetaStore,
            discovery,
            permissions: permissionEnabled ? permissions : undefined,
            catalog,
            httpAuth,
            auth,
            cache,
            userInfo,
            signals,
            notifications,
            aiHandler: aiExtension.aiHandler,
          }),
        );
        // Allowing attachments download
        httpRouter.addAuthPolicy({
          allow: 'unauthenticated',
          path: '/attachments',
        });

        await StatsCollector.initStatsCollector(
          config,
          scheduler,
          logger,
          qetaStore,
        );

        await TagsUpdater.initTagsUpdater(config, scheduler, logger, qetaStore);

        await AttachmentCleaner.initAttachmentCleaner(
          config,
          scheduler,
          logger,
          qetaStore,
          discovery,
          auth,
        );
      },
    });
  },
});
