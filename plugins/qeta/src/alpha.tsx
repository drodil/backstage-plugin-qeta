import {
  ApiBlueprint,
  coreExtensionData,
  createExtensionBlueprint,
  createExtensionDataRef,
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
import {
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  getSupportedEntityKinds,
  QetaClient,
} from '@drodil/backstage-plugin-qeta-common';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { Entity } from '@backstage/catalog-model';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { Pluggable } from 'unified/lib';

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

export const QetaPageIntroElementBlueprint = createExtensionBlueprint({
  kind: 'intro-element',
  attachTo: { id: 'page:qeta', input: 'introElement' },
  output: [coreExtensionData.reactElement],
  factory(params: { element: JSX.Element }) {
    return [coreExtensionData.reactElement(params.element)];
  },
});

export const QetaPageHeaderElementBlueprint = createExtensionBlueprint({
  kind: 'header-element',
  attachTo: { id: 'page:qeta', input: 'headerElements' },
  output: [coreExtensionData.reactElement],
  factory(params: { element: JSX.Element }) {
    return [coreExtensionData.reactElement(params.element)];
  },
});

export const markdownPlugin = createExtensionDataRef<Pluggable>().with({
  id: 'qeta.markdown-plugin',
});

export const QetaMarkdownRehypePluginBlueprint = createExtensionBlueprint({
  kind: 'markdown-plugin',
  attachTo: [
    { id: 'page:qeta', input: 'rehypePlugins' },
    { id: 'entity-posts-content', input: 'rehypePlugins' },
  ],
  output: [markdownPlugin],
  factory(params: { plugin: Pluggable }) {
    return [markdownPlugin(params.plugin)];
  },
});

export const QetaMarkdownRemarkPluginBlueprint = createExtensionBlueprint({
  kind: 'markdown-plugin',
  attachTo: [
    { id: 'page:qeta', input: 'remarkPlugins' },
    { id: 'entity-posts-content', input: 'remarkPlugins' },
  ],
  output: [markdownPlugin],
  factory(params: { plugin: Pluggable }) {
    return [markdownPlugin(params.plugin)];
  },
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
    rehypePlugins: createExtensionInput([markdownPlugin], {
      singleton: false,
      optional: true,
    }),
    remarkPlugins: createExtensionInput([markdownPlugin], {
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
    const remarkPlugins = inputs.remarkPlugins.map(e => e.get(markdownPlugin));
    const rehypePlugins = inputs.rehypePlugins.map(e => e.get(markdownPlugin));
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
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
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
  inputs: {
    rehypePlugins: createExtensionInput([markdownPlugin], {
      singleton: false,
      optional: true,
    }),
    remarkPlugins: createExtensionInput([markdownPlugin], {
      singleton: false,
      optional: true,
    }),
  },
  factory: (originalFactory, { config, apis, inputs }) => {
    return originalFactory({
      path: config.path ?? '/qeta',
      title: config.title ?? 'Q&A',
      filter: (entity: Entity) => {
        const configApi = apis.get(configApiRef);
        const supportedKinds = getSupportedEntityKinds(configApi);
        const entityKind = entity.kind.toLowerCase();
        return supportedKinds?.includes(entityKind);
      },
      loader: async () => {
        const remarkPlugins = inputs.remarkPlugins.map(e =>
          e.get(markdownPlugin),
        );
        const rehypePlugins = inputs.rehypePlugins.map(e =>
          e.get(markdownPlugin),
        );
        return import(
          './components/EntityPostsContent/EntityPostsContent.tsx'
        ).then(m =>
          compatWrapper(
            <m.EntityPostsContent
              {...config}
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
            />,
          ),
        );
      },
    });
  },
});

const qetaNavItem = NavItemBlueprint.make({
  params: {
    title: 'Q&A',
    routeRef: convertLegacyRouteRef(qetaRouteRef),
    icon: ContactSupportIcon,
  },
});

const qetaSearchResultItem = SearchResultListItemBlueprint.make({
  params: {
    predicate: result => result.type === 'qeta',
    component: () =>
      import('./components/QetaSearchResultListItem').then(
        m => m.QetaSearchResultListItem,
      ),
  },
});

const qetaPostSearchFilterType = SearchFilterResultTypeBlueprint.make({
  name: 'qeta',
  params: {
    value: 'qeta',
    name: 'Q&A',
    icon: <ContactSupportIcon />,
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
    EntityPostsContent,
    qetaNavItem,
    qetaSearchResultItem,
    qetaPostSearchFilterType,
  ],
});

export { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';
