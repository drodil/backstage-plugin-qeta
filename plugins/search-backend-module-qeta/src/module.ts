import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { readScheduleConfigOptions } from './collators/config';
import { DefaultQetaCollatorFactory } from './collators';

export const searchModuleQetaCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'qeta-collator',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({
        config,
        logger,
        discovery,
        auth,
        scheduler,
        indexRegistry,
      }) {
        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(
            readScheduleConfigOptions(config),
          ),
          factory: DefaultQetaCollatorFactory.fromConfig(config, {
            discovery,
            auth,
            logger,
          }),
        });
      },
    });
  },
});
