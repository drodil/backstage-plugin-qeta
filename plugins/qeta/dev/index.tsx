import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { QetaPage } from '../src/plugin';
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from '../src/routes';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { CatalogClient } from '@backstage/catalog-client';
import { TablePage } from './TablePage';
import { HomePage } from './HomePage';
import { StatisticsPage } from './StatisticsPage';

const fakeCatalogPlugin = createPlugin({
  id: 'catalog',
  routes: {
    catalogEntity: entityRouteRef,
  },
  apis: [
    createApiFactory({
      api: catalogApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new CatalogClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const CatalogEntityPage: () => JSX.Element = fakeCatalogPlugin.provide(
  createRoutableExtension({
    name: 'CatalogEntityPage',
    component: () => import('./ComponentPage').then(m => m.ComponentPage),
    mountPoint: entityRouteRef,
  }),
);

const qetaDevPlugin = createPlugin({
  id: 'qetaDev',
  routes: {
    root: rootRouteRef,
  },
  externalRoutes: {},
});

createDevApp()
  .registerPlugin(fakeCatalogPlugin)
  .registerPlugin(qetaDevPlugin)
  .addPage({
    element: (
      <QetaPage
        title="Questions and answers"
        subtitle="We have answers to everything!"
      />
    ),
    title: 'Root Page',
    path: '/qeta',
  })
  .addPage({
    element: <CatalogEntityPage />,
    title: 'Component',
    path: '/catalog/default/component/artist-web',
  })
  .addPage({
    element: <TablePage />,
    title: 'Table',
    path: '/table',
  })
  .addPage({
    element: <HomePage />,
    title: 'Home Page',
    path: '/home',
  })
  .addPage({
    element: <StatisticsPage />,
    title: 'Statistics Components',
    path: '/statistics',
  })
  .render();
