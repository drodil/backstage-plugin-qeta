import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerGetTagsAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });

  actionsRegistry.register({
    name: 'get-tags',
    title: 'Get Q&A tags',
    description: 'Lists Q&A tags with optional search and pagination.',
    attributes: {
      readOnly: true,
      idempotent: false,
      destructive: false,
    },
    schema: {
      input: z =>
        z.object({
          searchQuery: z.string().optional().describe('Search tags by name'),
          limit: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum number of tags to return'),
          offset: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Number of tags to skip'),
          orderBy: z
            .enum([
              'tag',
              'postsCount',
              'questionsCount',
              'articlesCount',
              'linksCount',
              'followerCount',
            ])
            .optional()
            .describe('Field used to order tags'),
          includeExperts: z
            .boolean()
            .optional()
            .describe('Whether to include tag experts'),
        }),
      output: z =>
        z.object({
          total: z.number().describe('Total number of matching tags'),
          tags: z.array(
            z.object({
              id: z.number().describe('Unique tag ID'),
              self: z.string().optional(),
              tag: z.string().describe('Tag name'),
              description: z.string().optional(),
              experts: z.array(z.string()).optional(),
              postsCount: z.number(),
              questionsCount: z.number(),
              articlesCount: z.number(),
              linksCount: z.number(),
              followerCount: z.number(),
            }),
          ),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const tags = await api.getTags(input, { token });
      return { output: tags };
    },
  });
};
