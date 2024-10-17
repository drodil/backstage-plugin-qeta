import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { QetaPage } from '../src/plugin';
import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { TablePage } from './TablePage';
import { HomePage } from './HomePage';
import { StatisticsPage } from './StatisticsPage';
import { TagPage } from './TagPage';
import {
  NotificationsPage,
  notificationsPlugin,
  NotificationsSidebarItem,
} from '@backstage/plugin-notifications';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { signalsPlugin } from '@backstage/plugin-signals';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Box from '@material-ui/core/Box';

const IntroElement = () => (
  <Box marginBottom={4}>
    <Alert severity="info">
      <AlertTitle>Introduction Element</AlertTitle>
      This component lives in introElement area. This component is displayed as
      Alert, but can contain any ReactNode component.
    </Alert>
  </Box>
);

export const CatalogEntityPage: () => JSX.Element = catalogPlugin.provide(
  createRoutableExtension({
    name: 'CatalogEntityPage',
    component: () => import('./ComponentPage').then(m => m.ComponentPage),
    mountPoint: entityRouteRef,
  }),
);

const qetaDevPlugin = createPlugin({
  id: 'qetaDev',
  routes: {
    root: qetaRouteRef,
  },
  externalRoutes: {},
});

createDevApp()
  .registerPlugin(catalogPlugin)
  .registerPlugin(qetaDevPlugin)
  .registerPlugin(notificationsPlugin)
  .registerPlugin(signalsPlugin)
  .addPage({
    element: (
      <QetaPage
        title="Questions and answers"
        subtitle="We have answers to everything!"
        headerType="See @ GitHub"
        headerTypeLink="https://github.com/drodil/backstage-plugin-qeta"
        headerTooltip="This is very cool plugin"
        introElement={<IntroElement />}
      />
    ),
    title: 'Root Page',
    path: '/qeta',
  })
  .addPage({
    element: <CatalogEntityPage />,
    title: 'Component',
    path: '/catalog/default/component/test-component',
  })
  .addPage({
    element: <TagPage />,
    title: 'Tag container',
    path: '/tag-container',
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
  .addPage({ element: <NotificationsPage />, path: '/notifications' })
  .addSidebarItem(<NotificationsSidebarItem />)
  .render();
