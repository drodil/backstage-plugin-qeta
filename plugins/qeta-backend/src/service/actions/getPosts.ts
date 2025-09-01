import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';

export const registerGetPostsAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });
  actionsRegistry.register({
    name: 'get-posts',
    title: 'Get Q&A posts',
    description: `
This allows you to get Q&A posts from the database with optional filtering. 
Posts are either questions or articles, both are returned if no type filter exists in the request.
Each questions can have multiple answers, and each post or answer can have multiple comments.
If question has answers, only one answer can be marked as correct.
Each post can be attached to multiple catalog entities which are referenced by their entity reference.
Each post can have multiple tags to help with categorization and search.
Score determines the popularity of a post based on upvotes and downvotes.
Post trend determines the popularity of a post based on views, votes, answers, and comments.
`,
    attributes: {
      readOnly: true,
      idempotent: false,
      destructive: false,
    },
    schema: {
      input: z =>
        z.object({
          tags: z.array(z.string()).optional().describe('Filter posts by tags'),
          entities: z
            .array(z.string())
            .optional()
            .describe('Filter posts by attached entity references'),
          author: z
            .string()
            .optional()
            .describe('Filter posts by author user entity reference'),
          type: z
            .enum(['question', 'article'])
            .optional()
            .describe('Filter posts by type'),
          limit: z
            .number()
            .optional()
            .describe('Limit the number of posts returned'),
          offset: z.number().optional().describe('Offset for pagination'),
          searchQuery: z.string().optional().describe('Full text search query'),
        }),
      output: z =>
        z.object({
          total: z
            .number()
            .describe('Total number of posts matching the filters'),
          posts: z.array(
            z.object({
              id: z.number().describe('The unique identifier of the post'),
              views: z
                .number()
                .describe('Number of views the post has received'),
              tags: z
                .array(z.string())
                .optional()
                .describe('Tags attached to the post'),
              entities: z
                .array(z.string())
                .optional()
                .describe('Catalog entity references attached to the post'),
              type: z
                .enum(['question', 'article'])
                .describe('The type of the post'),
              title: z.string().describe('The title of the post'),
              content: z
                .string()
                .describe('The content/body of the post in markdown format'),
              author: z
                .string()
                .describe('The author user entity reference of the post'),
              score: z
                .number()
                .describe(
                  'The score of the post based on upvotes and downvotes',
                ),
              trend: z
                .number()
                .optional()
                .describe(
                  'The trend score of the post based on views, votes, answers, and comments',
                ),
              comments: z
                .array(
                  z.object({
                    id: z
                      .number()
                      .describe('The unique identifier of the comment'),
                    author: z
                      .string()
                      .describe(
                        'The author user entity reference of the comment',
                      ),
                    content: z
                      .string()
                      .describe(
                        'The content/body of the comment in markdown format',
                      ),
                  }),
                )
                .optional()
                .describe('Comments on the post'),
              answers: z
                .array(
                  z.object({
                    id: z
                      .number()
                      .describe('The unique identifier of the answer'),
                    content: z
                      .string()
                      .describe(
                        'The content/body of the answer in markdown format',
                      ),
                    author: z
                      .string()
                      .describe(
                        'The author user entity reference of the answer',
                      ),
                    correct: z
                      .boolean()
                      .describe('Whether the answer is marked as correct'),
                    score: z
                      .number()
                      .describe(
                        'The score of the answer based on upvotes and downvotes',
                      ),
                    comments: z
                      .array(
                        z.object({
                          id: z
                            .number()
                            .describe('The unique identifier of the comment'),
                          author: z
                            .string()
                            .describe(
                              'The author user entity reference of the comment',
                            ),
                          content: z
                            .string()
                            .describe(
                              'The content/body of the comment in markdown format',
                            ),
                        }),
                      )
                      .optional()
                      .describe('Comments on the answer'),
                  }),
                )
                .optional()
                .describe(
                  'Answers to the question (if the post is a question)',
                ),
            }),
          ),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const posts = await api.getPosts(
        {
          ...input,
          includeAnswers: true,
          includeEntities: true,
          includeTags: true,
          includeTrend: true,
          includeComments: true,
          includeVotes: true,
        },
        { token },
      );
      return {
        output: posts,
      };
    },
  });
};
