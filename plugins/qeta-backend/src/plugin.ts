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
import { BadgeManager } from './service/BadgeManager';
import { CatalogClient } from '@backstage/catalog-client';
import {
  AIHandler,
  NotificationReceiversHandler,
  qetaAIExtensionPoint,
  QetaAIExtensionPoint,
  qetaNotificationReceiversExtensionPoint,
  QetaNotificationReceiversExtensionPoint,
  qetaTagDatabaseExtensionPoint,
  QetaTagDatabaseExtensionPoint,
  TagDatabase,
} from '@drodil/backstage-plugin-qeta-node';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { registerActions } from './service/actions';

class QetaAIExtensionPointImpl implements QetaAIExtensionPoint {
  #aiHandler?: AIHandler;

  get aiHandler() {
    return this.#aiHandler;
  }

  setAIHandler(handler: AIHandler) {
    this.#aiHandler = handler;
  }
}

class QetaTagsDatabaseExtensionPointImpl
  implements QetaTagDatabaseExtensionPoint
{
  #tagDatabase?: TagDatabase;

  get tagDatabase() {
    return this.#tagDatabase;
  }

  setTagDatabase(tagDatabase: TagDatabase) {
    this.#tagDatabase = tagDatabase;
  }
}

class QetaNotificationReceiversExtensionPointImpl
  implements QetaNotificationReceiversExtensionPoint
{
  #notificationReceivers?: NotificationReceiversHandler;

  get handler() {
    return this.#notificationReceivers;
  }

  setHandler(handler: NotificationReceiversHandler) {
    this.#notificationReceivers = handler;
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

    const tagsExtension = new QetaTagsDatabaseExtensionPointImpl();
    env.registerExtensionPoint(qetaTagDatabaseExtensionPoint, tagsExtension);

    const notificationReceiversExtension =
      new QetaNotificationReceiversExtensionPointImpl();
    env.registerExtensionPoint(
      qetaNotificationReceiversExtensionPoint,
      notificationReceiversExtension,
    );

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
        permissionsRegistry: coreServices.permissionsRegistry,
        auditor: coreServices.auditor,
        actionsRegistry: actionsRegistryServiceRef,
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
        permissionsRegistry,
        auditor,
        actionsRegistry,
      }) {
        const qetaStore = await DatabaseQetaStore.create({
          database,
          tagDatabase: tagsExtension.tagDatabase,
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
            permissionsRegistry,
            auditor,
            notificationReceivers: notificationReceiversExtension.handler,
          }),
        );
        // Allowing attachments download
        httpRouter.addAuthPolicy({
          allow: 'unauthenticated',
          path: '/attachments',
        });

        registerActions({ auth, actionsRegistry, discovery });

        const badgeManager = new BadgeManager(qetaStore);

        await StatsCollector.initStatsCollector(
          config,
          scheduler,
          logger,
          qetaStore,
          badgeManager,
          events,
        );

        await TagsUpdater.initTagsUpdater(
          config,
          scheduler,
          logger,
          qetaStore,
          tagsExtension.tagDatabase,
        );

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
