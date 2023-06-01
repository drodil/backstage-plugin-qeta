import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { QetaPage } from '../src/plugin';
import {
  AnyApiFactory,
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from '../src/routes';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CatalogClient } from '@backstage/catalog-client';
import { TablePage } from './TablePage';
import { HomePage } from './HomePage';
import { StatisticsPage } from './StatisticsPage';

const apiFactories: AnyApiFactory[] = [
  createApiFactory({
    api: catalogApiRef,
    deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
    factory: ({ discoveryApi, fetchApi }) =>
      new CatalogClient({ discoveryApi, fetchApi }),
  }),
];

const qetaDevPlugin = createPlugin({
  id: 'qetaDev',
  routes: {
    root: rootRouteRef,
  },
  apis: apiFactories,
});

createDevApp()
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
