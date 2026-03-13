import { createFrontendModule } from '@backstage/frontend-plugin-api';
// NEW FRONTEND SYSTEM
import { createApp } from '@backstage/frontend-defaults';
import { createRoot } from 'react-dom/client';
import notificationPlugin from '@backstage/plugin-notifications/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';

import plugin from '../src/alpha';
import {
  QetaMarkdownRehypePluginBlueprint,
  QetaPageHeaderElementBlueprint,
  QetaPageIntroElementBlueprint,
} from '@drodil/backstage-plugin-qeta-react/alpha';
import { Box } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import searchPlugin from '@backstage/plugin-search/alpha';
import rehypeMermaid from 'rehype-mermaid';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import signalsPlugin from '@backstage/plugin-signals/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import homePlugin from '@backstage/plugin-home/alpha';

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

const IntroElement = () => (
  <Box marginBottom={4}>
    <Alert severity="info">
      <AlertTitle>Introduction Element</AlertTitle>
      This component lives in introElement area. This component is displayed as
      Alert, but can contain any ReactNode component.
    </Alert>
  </Box>
);

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

// Add to enable persistent settings
/** export const userSettingsApiModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: storageApiRef,
          deps: {
            fetchApi: fetchApiRef,
            discoveryApi: discoveryApiRef,
            errorApi: errorApiRef,
            identityApi: identityApiRef,
            signalApi: signalApiRef,
          },
          factory: ({
            fetchApi,
            discoveryApi,
            errorApi,
            identityApi,
            signalApi,
          }) =>
            UserSettingsStorage.create({
              fetchApi,
              discoveryApi,
              errorApi,
              identityApi,
              signalApi,
            }),
        }),
    }),
  ],
});
    */

const app = createApp({
  features: [
    plugin,
    homePlugin,
    notificationPlugin,
    catalogPlugin,
    searchPlugin,
    techdocsPlugin,
    module,
    signalsPlugin,
    userSettingsPlugin,
    // userSettingsApiModule,
  ],
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(app.createRoot());
