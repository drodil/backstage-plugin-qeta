import {
  ApiBlueprint,
  coreExtensionData,
  createExtensionInput,
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
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

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

const qetaPage = PageBlueprint.makeWithOverrides({
  config: {
    schema: {
      subtitle: z => z.string().optional(),
      themeId: z => z.string().optional(),
      headerTooltip: z => z.string().optional(),
      headerType: z => z.string().optional(),
      headerTypeLink: z => z.string().optional(),
    },
  },
  inputs: {
    introElement: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
      optional: true,
    }),
    headerElements: createExtensionInput([coreExtensionData.reactElement], {
      singleton: false,
      optional: true,
    }),
  },
  factory: (originalFactory, { config, inputs }) => {
    const introElement = inputs.introElement?.get(
      coreExtensionData.reactElement,
    );
    const headerElements = inputs.headerElements.map(e =>
      e.get(coreExtensionData.reactElement),
    );
    return originalFactory({
      path: config.path ?? '/qeta',
      routeRef: convertLegacyRouteRef(qetaRouteRef),
      loader: () =>
        import('./components/QetaPage').then(m =>
          compatWrapper(
            <m.QetaPage
              {...config}
              introElement={introElement}
              headerElements={headerElements}
            />,
          ),
        ),
    });
  },
});

const EntityPostsContent = EntityContentBlueprint.makeWithOverrides({
  name: 'entity-posts-content',
  config: {
    schema: {
      showFilters: z => z.boolean().optional(),
      showTitle: z => z.boolean().optional(),
      showAskButton: z => z.boolean().optional(),
      showWriteButton: z => z.boolean().optional(),
      showLinkButton: z => z.boolean().optional(),
      showNoQuestionsBtn: z => z.boolean().optional(),
      initialPageSize: z => z.number().optional(),
      type: z => z.enum(['question', 'article', 'link']).optional(),
      view: z => z.enum(['list', 'grid']).optional(),
    },
  },
  factory: (originalFactory, { config }) => {
    return originalFactory({
      path: config.path ?? '/qeta',
      title: config.title ?? 'Q&A',
      loader: async () =>
        import('./components/EntityPostsContent/EntityPostsContent.tsx').then(
          m => compatWrapper(<m.EntityPostsContent {...config} />),
        ),
    });
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
  extensions: [qetaApi, qetaPage, EntityPostsContent, qetaNavItem],
});

export { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';
