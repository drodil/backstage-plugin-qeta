import { createFrontendModule } from '@backstage/frontend-plugin-api';
// NEW FRONTEND SYSTEM
import { createApp } from '@backstage/frontend-defaults';
import { createRoot } from 'react-dom/client';
import notificationPlugin from '@backstage/plugin-notifications/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';

import plugin, {
  QetaMarkdownRehypePluginBlueprint,
  QetaPageHeaderElementBlueprint,
  QetaPageIntroElementBlueprint,
} from '../src/alpha';
import { Box } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import searchPlugin from '@backstage/plugin-search/alpha';
import rehypeMermaid from 'rehype-mermaid';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';

const IntroElement = () => (
  <Box marginBottom={4}>
    <Alert severity="info">
      <AlertTitle>Introduction Element</AlertTitle>
      This component lives in introElement area. This component is displayed as
      Alert, but can contain any ReactNode component.
    </Alert>
  </Box>
);

/** import { createDevApp } from '@backstage/dev-utils';
import { QetaPage } from '../src/plugin';
import { createPlugin } from '@backstage/core-plugin-api';
import { qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { TablePage } from './TablePage';
import { HomePage } from './HomePage';
import { TagPage } from './TagPage';
import {
  NotificationsPage,
  notificationsPlugin,
  NotificationsSidebarItem,
} from '@backstage/plugin-notifications';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { signalsPlugin } from '@backstage/plugin-signals';
import { Box } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { searchPage } from './SearchPage';
import { searchPlugin } from '@backstage/plugin-search';
import { ComponentPage } from './ComponentPage.tsx';

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
  .registerPlugin(searchPlugin)
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
    element: <ComponentPage />,
    title: 'Catalog Page',
    path: '/catalog/default/component/test-component',
  })
  .addPage({
    element: searchPage,
    title: 'Search',
    path: '/search',
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
  .addPage({ element: <NotificationsPage />, path: '/notifications' })
  .addSidebarItem(<NotificationsSidebarItem />)
  .render();
 */

const module = createFrontendModule({
  pluginId: 'qeta',
  extensions: [
    QetaPageIntroElementBlueprint.make({
      params: {
        element: <IntroElement />,
      },
    }),
    QetaPageHeaderElementBlueprint.make({
      params: {
        element: <div>Extra header element</div>,
      },
    }),
    QetaMarkdownRehypePluginBlueprint.make({
      params: {
        plugin: rehypeMermaid,
      },
    }),
  ],
});

const app = createApp({
  features: [
    plugin,
    notificationPlugin,
    catalogPlugin,
    searchPlugin,
    techdocsPlugin,
    module,
  ],
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(app.createRoot());
