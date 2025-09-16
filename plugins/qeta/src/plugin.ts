import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home-react';
import { createSearchResultListItemExtension } from '@backstage/plugin-search-react';
import { qetaApiRef, qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { PostType, QetaClient } from '@drodil/backstage-plugin-qeta-common';
import type { QetaSearchResultListItemProps } from './components/QetaSearchResultListItem';

export const qetaPlugin = createPlugin({
  id: 'qeta',
  routes: {
    root: qetaRouteRef,
  },
  apis: [
    createApiFactory({
      api: qetaApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ fetchApi, discoveryApi }) =>
        new QetaClient({ fetchApi, discoveryApi }),
    }),
  ],
});

export const QetaPage = qetaPlugin.provide(
  createRoutableExtension({
    name: 'QetaPage',
    component: () => import('./components/QetaPage').then(m => m.QetaPage),
    mountPoint: qetaRouteRef,
  }),
);

export const PostsTableCard = qetaPlugin.provide(
  createCardExtension<{
    postType?: PostType;
    rowsPerPage?: number;
    quickFilter?: string;
  }>({
    name: 'PostsTableCard',
    title: 'Q&A',
    description: 'Shows Q&A posts',
    components: () => import('./components/PostsTableCard'),
    layout: {
      height: { minRows: 6 },
      width: { minColumns: 6 },
    },
    settings: {
      schema: {
        title: 'Q&A',
        type: 'object',
        properties: {
          postType: {
            title: 'Post type',
            type: 'string',
            enum: ['question', 'article', 'link'],
            default: undefined,
          },
          rowsPerPage: {
            title: 'Rows per page',
            type: 'number',
            enum: [5, 10, 20, 30, 40, 50],
            default: 10,
          },
          quickFilter: {
            title: 'Default filter',
            type: 'string',
            enum: ['latest', 'favorites', 'most_viewed'],
            default: 'latest',
          },
        },
      },
    },
  }),
);

/**
 * @deprecated Use PostsTableCard instead
 */
export const QuestionsTableCard = PostsTableCard;

/**
 * React extension used to render results on Search page or modal
 *
 * @public
 */
export const QetaSearchResultListItem: (
  props: QetaSearchResultListItemProps,
) => JSX.Element | null = qetaPlugin.provide(
  createSearchResultListItemExtension({
    name: 'QetaSearchResultListItem',
    component: () =>
      import('./components/QetaSearchResultListItem').then(
        m => m.QetaSearchResultListItem,
      ),
    predicate: result => result.type === 'qeta',
  }),
);
