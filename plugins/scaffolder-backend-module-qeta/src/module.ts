import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createQetaActions } from './actions';

export const scaffolderModuleQeta = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'qeta',
  register(reg) {
    reg.registerInit({
      deps: {
        auth: coreServices.auth,
        discovery: coreServices.discovery,
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder, auth, discovery }) {
        scaffolder.addActions(...createQetaActions({ auth, discovery }));
      },
    });
  },
});
