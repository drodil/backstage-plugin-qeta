import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { PermissionPolicy } from './PermissionPolicy';

const backend = createBackend();
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-events-backend'));
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  createBackendModule({
    pluginId: 'permission',
    moduleId: 'qeta-permission-policy',
    register(reg) {
      reg.registerInit({
        deps: {
          policy: policyExtensionPoint,
          discovery: coreServices.discovery,
          auth: coreServices.auth,
        },
        async init({ policy, auth, discovery }) {
          policy.setPolicy(new PermissionPolicy(auth, discovery));
        },
      });
    },
  }),
);

backend.add(import('../src'));

backend.start();
