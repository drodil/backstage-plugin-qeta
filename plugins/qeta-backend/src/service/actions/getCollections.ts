import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerGetCollectionsAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });

  actionsRegistry.register({
    name: 'get-collections',
    title: 'Get Q&A collections',
    description:
      'Lists Q&A collections with optional filters and pagination. Set includePosts to include the posts in each collection.',
    attributes: {
      readOnly: true,
      idempotent: false,
      destructive: false,
    },
    schema: {
      input: z =>
        z.object({
          searchQuery: z
            .string()
            .optional()
            .describe('Search collections by title or description'),
          owner: z
            .string()
            .optional()
            .describe('Filter by collection owner user entity reference'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Filter by collection tags'),
          tagsRelation: z
            .enum(['and', 'or'])
            .optional()
            .describe('How to combine tag filters'),
          entities: z
            .array(z.string())
            .optional()
            .describe('Filter by attached catalog entity references'),
          entitiesRelation: z
            .enum(['and', 'or'])
            .optional()
            .describe('How to combine entity filters'),
          ids: z
            .array(z.number().int().positive())
            .optional()
            .describe('Filter by collection IDs'),
          includePosts: z
            .boolean()
            .optional()
            .describe('Whether to include posts in each collection'),
          includeExperts: z
            .boolean()
            .optional()
            .describe('Whether to include collection experts'),
          limit: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum number of collections to return'),
          offset: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Number of collections to skip'),
          orderBy: z
            .enum([
              'created',
              'title',
              'postsCount',
              'questionsCount',
              'articlesCount',
              'linksCount',
              'followerCount',
            ])
            .optional()
            .describe('Field used to order collections'),
          order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        }),
      output: z =>
        z.object({
          total: z.number().describe('Total number of matching collections'),
          collections: z.array(
            z.object({
              id: z.number().describe('Unique collection ID'),
              self: z.string().optional(),
              title: z.string().describe('Collection title'),
              description: z.string().optional(),
              owner: z.string().describe('Owner user entity reference'),
              tags: z.array(z.string()).optional(),
              entities: z.array(z.string()).optional(),
              postsCount: z.number(),
              questionsCount: z.number(),
              articlesCount: z.number(),
              linksCount: z.number(),
              followers: z.number(),
              posts: z
                .array(
                  z.object({
                    id: z.number(),
                    title: z.string(),
                    content: z.string(),
                    type: z.enum(['question', 'article', 'link']),
                    status: z.enum(['active', 'draft', 'deleted', 'obsolete']),
                    self: z.string().optional(),
                  }),
                )
                .optional(),
            }),
          ),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const collections = await api.getCollections(input, { token });
      return { output: collections };
    },
  });
};
