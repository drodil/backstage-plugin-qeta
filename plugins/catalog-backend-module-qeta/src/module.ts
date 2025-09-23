import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { CatalogEntityLinkProcessor } from './processors/CatalogEntityLinkProcessor.ts';

export const catalogModuleQeta = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'qeta',
  register(reg) {
    reg.registerInit({
      deps: {
        builder: catalogProcessingExtensionPoint,
        cache: coreServices.cache,
        auth: coreServices.auth,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        lifecycle: coreServices.rootLifecycle,
      },
      async init({ builder, cache, auth, logger, discovery, lifecycle }) {
        builder.addProcessor(
          new CatalogEntityLinkProcessor(
            auth,
            cache,
            logger,
            discovery,
            lifecycle,
          ),
        );
      },
    });
  },
});
