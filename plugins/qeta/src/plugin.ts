import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { qetaApiRef, QetaClient } from './api';
// import { catalogApiRef } from '@backstage/plugin-catalog-react';
// import { CatalogClient } from '@backstage/catalog-client';

const apiFactories: AnyApiFactory[] = [
  createApiFactory({
    api: qetaApiRef,
    deps: { configApi: configApiRef, fetchApi: fetchApiRef },
    factory: ({ configApi, fetchApi }) =>
      new QetaClient({ configApi, fetchApi }),
  }),
];

// TODO: Figure way to only add catalog api in local development
// If this is enabled and used by a real backstage app, it will
// die horribly with an error.
/*
const catalogApi = createApiFactory({
  api: catalogApiRef,
  deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, fetchApi }) =>
    new CatalogClient({ discoveryApi, fetchApi }),
});
apiFactories.push(catalogApi);
*/

export const qetaPlugin = createPlugin({
  id: 'qeta',
  routes: {
    root: rootRouteRef,
  },
  apis: apiFactories,
});

export const QetaPage = qetaPlugin.provide(
  createRoutableExtension({
    name: 'QetaPage',
    component: () => import('./components/HomePage').then(m => m.HomePage),
    mountPoint: rootRouteRef,
  }),
);
