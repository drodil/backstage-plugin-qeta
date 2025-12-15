import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerCommentPostAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });
  actionsRegistry.register({
    name: 'comment-post',
    title: 'Comment on a Q&A post',
    description:
      'This action allows to post a comment on an existing post in the Q&A system.',
    attributes: {
      idempotent: true,
      destructive: false,
      readOnly: false,
    },
    schema: {
      input: z =>
        z.object({
          postId: z.number().describe('The unique identifier of the post'),
          comment: z
            .string()
            .describe('The content/body of the comment in markdown format'),
        }),
      output: z =>
        z.object({
          id: z.number().describe('The post id'),
          self: z.string().describe('Link to the comment').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const post = await api.commentPost(input.postId, input.comment, {
        token,
      });
      return { output: post };
    },
  });
};

export const registerCommentAnswerAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });
  actionsRegistry.register({
    name: 'comment-answer',
    title: 'Comment on a Q&A answer',
    description: `This action allows to post a comment on an existing answer in the Q&A system.
      Answers can only be commented on if they belong to a question post.`,
    attributes: {
      idempotent: true,
      destructive: false,
      readOnly: false,
    },
    schema: {
      input: z =>
        z.object({
          postId: z.number().describe('The unique identifier of the question'),
          answerId: z.number().describe('The unique identifier of the answer'),
          comment: z
            .string()
            .describe('The content/body of the comment in markdown format'),
        }),
      output: z =>
        z.object({
          id: z.number().describe('The answer id'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const answer = await api.commentAnswer(
        input.postId,
        input.answerId,
        input.comment,
        {
          token,
        },
      );
      return { output: answer };
    },
  });
};
