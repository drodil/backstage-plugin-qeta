import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerPostActions = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });
  actionsRegistry.register({
    name: 'ask-question',
    title: 'Ask a Q&A question',
    description: 'This allows you to ask a new question in the Q&A system.',
    attributes: {
      idempotent: true,
      destructive: false,
      readOnly: false,
    },
    schema: {
      input: z =>
        z.object({
          title: z.string().describe('The title of the question'),
          content: z
            .string()
            .describe('The content/body of the question in markdown format'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Optional tags to categorize the question'),
          entities: z
            .array(z.string())
            .optional()
            .describe(
              'Optional catalog entity references to attach to the question',
            ),
        }),
      output: z =>
        z.object({
          id: z
            .number()
            .describe('The unique identifier of the created question'),
          title: z.string().describe('The title of the question'),
          content: z
            .string()
            .describe('The content/body of the question in markdown format'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Tags associated with the question'),
          entities: z
            .array(z.string())
            .optional()
            .describe('Catalog entity references attached to the question'),
          self: z.string().describe('Link to created question').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const question = await api.createPost(
        {
          ...input,
          type: 'question',
        },
        { token },
      );
      return { output: question };
    },
  });

  actionsRegistry.register({
    name: 'write-article',
    title: 'Write a Q&A article',
    description: 'This allows you to write a new article in the Q&A system.',
    attributes: {
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          title: z.string().describe('The title of the article'),
          content: z.string().describe('The content/body of the article'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Optional tags to categorize the article'),
          entities: z
            .array(z.string())
            .optional()
            .describe(
              'Optional catalog entity references to attach to the article',
            ),
        }),
      output: z =>
        z.object({
          id: z
            .number()
            .describe('The unique identifier of the created article'),
          title: z.string().describe('The title of the article'),
          content: z.string().describe('The content/body of the article'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Tags associated with the article'),
          entities: z
            .array(z.string())
            .optional()
            .describe('Catalog entity references attached to the article'),
          self: z.string().describe('Link to created article').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const article = await api.createPost(
        {
          ...input,
          type: 'article',
        },
        { token },
      );
      return { output: article };
    },
  });

  actionsRegistry.register({
    name: 'post-link',
    title: 'Post a Q&A knowledge link',
    description: 'This allows you to post a new link in the Q&A system.',
    attributes: {
      idempotent: true,
      destructive: false,
      readOnly: false,
    },
    schema: {
      input: z =>
        z.object({
          title: z.string().describe('The title of the link'),
          content: z.string().url().describe('The URL'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Optional tags to categorize the link'),
          entities: z
            .array(z.string())
            .optional()
            .describe(
              'Optional catalog entity references to attach to the link',
            ),
        }),
      output: z =>
        z.object({
          id: z.number().describe('The unique identifier of the created link'),
          title: z.string().describe('The title of the link'),
          content: z.string().url().describe('The URL'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Tags associated with the link'),
          entities: z
            .array(z.string())
            .optional()
            .describe('Catalog entity references attached to the link'),
          self: z.string().describe('Link to created link').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const link = await api.createPost(
        {
          ...input,
          type: 'link',
        },
        { token },
      );
      return { output: link };
    },
  });
};
