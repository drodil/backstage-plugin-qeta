import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { qetaApiRef, QetaClient } from './api';

export const qetaPlugin = createPlugin({
  id: 'qeta',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: qetaApiRef,
      deps: { configApi: configApiRef, fetchApi: fetchApiRef },
      factory: ({ configApi, fetchApi }) =>
        new QetaClient({ configApi, fetchApi }),
    }),
  ],
});

export const QetaPage = qetaPlugin.provide(
  createRoutableExtension({
    name: 'QetaPage',
    component: () => import('./components/HomePage').then(m => m.HomePage),
    mountPoint: rootRouteRef,
  }),
);
