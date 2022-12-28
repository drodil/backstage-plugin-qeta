import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { qetaApiRef, QetaClient } from './api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CatalogClient } from '@backstage/catalog-client';

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
    createApiFactory({
      api: catalogApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new CatalogClient({ discoveryApi, fetchApi }),
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
