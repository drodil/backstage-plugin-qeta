import {
  ApiBlueprint,
  createFrontendPlugin,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { qetaApiRef, qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

const qetaApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: qetaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new QetaClient({ discoveryApi, fetchApi });
      },
    }),
});

const qetaPage = PageBlueprint.make({
  params: {
    path: '/qeta',
    routeRef: convertLegacyRouteRef(qetaRouteRef),
    loader: () =>
      import('./components/QetaPage').then(m => compatWrapper(<m.QetaPage />)),
  },
});

const EntityPostsGridCard = EntityCardBlueprint.make({
  name: 'entity-posts-grid',
  params: {
    loader: async () =>
      import('./components/EntityCards/EntityPostsGridCard').then(m =>
        compatWrapper(<m.EntityPostsGridCard />),
      ),
  },
});

const EntityPostsContainerCard = EntityCardBlueprint.make({
  name: 'entity-posts-container',
  params: {
    loader: async () =>
      import('./components/EntityCards/EntityPostsContainerCard').then(m =>
        compatWrapper(<m.EntityPostsContainerCard />),
      ),
  },
});

/** @alpha */
export const qetaNavItem = NavItemBlueprint.make({
  params: {
    title: 'Q&A',
    routeRef: convertLegacyRouteRef(qetaRouteRef),
    icon: LiveHelpIcon,
  },
});

/**
 * Backstage frontend plugin.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'qeta',
  info: { packageJson: () => import('../package.json') },
  routes: convertLegacyRouteRefs({
    root: qetaRouteRef,
  }),
  extensions: [
    qetaApi,
    qetaPage,
    EntityPostsGridCard,
    EntityPostsContainerCard,
    qetaNavItem,
  ],
});

export { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';
