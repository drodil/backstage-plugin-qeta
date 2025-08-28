import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const registerAnswerQuestionAction = (options: {
  actionsRegistry: ActionsRegistryService;
  discovery: DiscoveryService;
  auth: AuthService;
}) => {
  const { actionsRegistry, discovery, auth } = options;
  const api = new QetaClient({ discoveryApi: discovery });
  actionsRegistry.register({
    name: 'answer-question',
    title: 'Answer a Q&A question',
    description:
      'This allows you to provide an answer to an existing question.',
    attributes: {
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          postId: z
            .number()
            .describe('The unique identifier of the question to answer'),
          answer: z
            .string()
            .describe('The content/body of the answer in markdown format'),
        }),
      output: z =>
        z.object({
          id: z
            .number()
            .describe('The unique identifier of the created answer'),
          postId: z
            .number()
            .describe('The unique identifier of the question answered'),
          content: z
            .string()
            .describe('The content/body of the answer in markdown format'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const answer = await api.postAnswer(input, { token });
      return { output: answer };
    },
  });
};
