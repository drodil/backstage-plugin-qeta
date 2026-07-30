import {
  ApiBlueprint,
  coreExtensionData,
  createExtensionInput,
  createFrontendPlugin,
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
  createApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  getSupportedEntityKinds,
  QetaClient,
} from '@drodil/backstage-plugin-qeta-common';
import { RiQuestionAnswerLine } from '@remixicon/react';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { Entity } from '@backstage/catalog-model';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { TechDocsAddonLocations } from '@backstage/plugin-techdocs-react';
import { AddonBlueprint } from '@backstage/plugin-techdocs-react/alpha';
import { TechDocsAskQuestionAddon } from './components/TechDocsAskQuestionAddon';
import { Pluggable } from 'unified';
import { markdownPlugin } from '@drodil/backstage-plugin-qeta-react';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';

interface QetaMarkdownPluginsApi {
  getRehypePlugins(): Pluggable[];
  getRemarkPlugins(): Pluggable[];
}

export const qetaMarkdownPluginsApiRef = createApiRef<QetaMarkdownPluginsApi>({
  id: 'plugin.qeta.addons',
});

export const qetaMarkdownPluginsApiExtension = ApiBlueprint.makeWithOverrides({
  name: 'addons',
  inputs: {
    rehypePlugins: createExtensionInput([markdownPlugin]),
    remarkPlugins: createExtensionInput([markdownPlugin]),
  },
  factory(originalFactory, { inputs }) {
    const rehypePlugins = inputs.rehypePlugins.map(output =>
      output.get(markdownPlugin),
    );
    const remarkPlugins = inputs.remarkPlugins.map(output =>
      output.get(markdownPlugin),
    );
    return originalFactory(defineParams =>
      defineParams({
        api: qetaMarkdownPluginsApiRef,
        deps: {},
        factory: () => ({
          getRehypePlugins: () => rehypePlugins,
          getRemarkPlugins: () => remarkPlugins,
        }),
      }),
    );
  },
});

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
      themeId: z => z.string().optional(),
    },
  },
  inputs: {
    introElement: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
      optional: true,
    }),
  },
  factory: (originalFactory, { config, inputs, apis }) => {
    const introElement = inputs.introElement?.get(
      coreExtensionData.reactElement,
    );
    const pluginsApi = apis.get(qetaMarkdownPluginsApiRef);
    const remarkPlugins = pluginsApi?.getRemarkPlugins();
    const rehypePlugins = pluginsApi?.getRehypePlugins();
    return originalFactory({
      path: config.path ?? '/qeta',
      title: config.title ?? 'Q&A',
      icon: <RiQuestionAnswerLine />,
      routeRef: convertLegacyRouteRef(qetaRouteRef),
      loader: () =>
        import('./components/QetaPage').then(m =>
          compatWrapper(
            <m.QetaPage
              themeId={config.themeId}
              introElement={introElement}
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
      relations: z => z.array(z.string()).optional(),
    },
  },
  inputs: {},
  factory: (originalFactory, { config, apis }) => {
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
        const pluginsApi = apis.get(qetaMarkdownPluginsApiRef);
        const remarkPlugins = pluginsApi?.getRemarkPlugins();
        const rehypePlugins = pluginsApi?.getRehypePlugins();
        return import('./components/EntityPostsContent/EntityPostsContent.tsx').then(
          m =>
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
    icon: <RiQuestionAnswerLine />,
  },
});

const techDocsAskQuestionAddon = AddonBlueprint.make({
  name: 'ask-question',
  params: {
    name: 'AskQuestion',
    location: TechDocsAddonLocations.Content,
    component: TechDocsAskQuestionAddon,
  },
});

const homePageTable = HomePageWidgetBlueprint.make({
  name: 'home-posts-table',
  params: {
    title: 'Q&A posts',
    description: 'Shows latest Q&A posts',
    components: () =>
      import('../src/components/PostsTableCard').then(m => ({
        Content: m.Content,
      })),
    settings: {
      schema: {
        title: 'Post settings',
        type: 'object',
        properties: {
          rowsPerPage: {
            title: 'Rows per page',
            type: 'number',
          },
          postType: {
            title: 'Post type',
            type: 'string',
            enum: ['all', 'question', 'article', 'link'],
          },
        },
      },
    },
  },
});

const homeTimeline = HomePageWidgetBlueprint.make({
  name: 'home-posts-timeline',
  params: {
    title: 'Q&A timeline',
    description: 'Shows Q&A latest events',
    components: () =>
      import('../src/components/HomeTimeline').then(m => ({
        Content: m.HomeTimeline,
      })),
  },
});

/**
 * Backstage frontend plugin.
 */
const qetaPlugin = createFrontendPlugin({
  pluginId: 'qeta',
  info: { packageJson: () => import('../package.json') },
  routes: convertLegacyRouteRefs({
    root: qetaRouteRef,
  }),
  extensions: [
    qetaApi,
    qetaPage,
    EntityPostsContent,
    qetaSearchResultItem,
    qetaPostSearchFilterType,
    techDocsAskQuestionAddon,
    qetaMarkdownPluginsApiExtension,
    homePageTable,
    homeTimeline,
  ],
});

export default qetaPlugin;

export { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';

export {
  /** @deprecated Use blueprints from `@drodil/backstage-plugin-qeta-react` instead. */
  QetaMarkdownRehypePluginBlueprint,
  /** @deprecated Use blueprints from `@drodil/backstage-plugin-qeta-react` instead. */
  QetaPageIntroElementBlueprint,
  /** @deprecated Use blueprints from `@drodil/backstage-plugin-qeta-react` instead. */
  QetaMarkdownRemarkPluginBlueprint,
} from '@drodil/backstage-plugin-qeta-react';
