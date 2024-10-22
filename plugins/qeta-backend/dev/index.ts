import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
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
        },
        async init({ policy }) {
          policy.setPolicy(new PermissionPolicy());
        },
      });
    },
  }),
);

backend.add(import('../src'));

backend.start();
