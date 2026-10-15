import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerAddPostToCollectionAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });

  actionsRegistry.register({
    name: 'add-post-to-collection',
    title: 'Add a Q&A post to a collection',
    description: 'Adds an existing Q&A post to a collection.',
    attributes: {
      idempotent: true,
      destructive: false,
      readOnly: false,
    },
    schema: {
      input: z =>
        z.object({
          collectionId: z
            .number()
            .int()
            .positive()
            .describe('The collection ID'),
          postId: z.number().int().positive().describe('The post ID'),
        }),
      output: z =>
        z.object({
          collectionId: z.number(),
          postId: z.number(),
          title: z.string(),
          postsCount: z.number(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const collection = await api.addPostToCollection(
        input.collectionId,
        input.postId,
        { token },
      );

      return {
        output: {
          collectionId: collection.id,
          postId: input.postId,
          title: collection.title,
          postsCount: collection.postsCount,
        },
      };
    },
  });
};
