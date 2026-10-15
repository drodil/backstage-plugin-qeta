import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import { uploadPostImages } from './util';

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
          draft: z
            .boolean()
            .optional()
            .describe('Whether to save the question as a draft'),
          collectionId: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Optional collection ID to add the question to'),
          images: z
            .array(
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            )
            .optional()
            .describe(
              'Optional image files to upload and attach to the question',
            ),
          headerImage: z
            .union([
              z.string().url(),
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            ])
            .optional()
            .describe('Optional header image URL or base64-encoded image'),
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
          status: z
            .enum(['active', 'draft', 'deleted', 'obsolete'])
            .optional()
            .describe('Question status'),
          collectionId: z
            .number()
            .optional()
            .describe('Collection the question was added to'),
          self: z.string().describe('Link to created question').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const {
        draft,
        collectionId,
        images: imageInputs,
        headerImage,
        ...questionInput
      } = input;
      const imageFields = await uploadPostImages(
        api,
        imageInputs,
        headerImage,
        token,
      );
      const question = await api.createPost(
        {
          ...questionInput,
          ...imageFields,
          type: 'question',
          status: draft ? 'draft' : 'active',
        },
        { token },
      );
      if (collectionId !== undefined) {
        await api.addPostToCollection(collectionId, question.id, { token });
      }
      return {
        output: {
          ...question,
          ...(collectionId !== undefined ? { collectionId } : {}),
        },
      };
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
          draft: z
            .boolean()
            .optional()
            .describe('Whether to save the article as a draft'),
          collectionId: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Optional collection ID to add the article to'),
          images: z
            .array(
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            )
            .optional()
            .describe(
              'Optional image files to upload and attach to the article',
            ),
          headerImage: z
            .union([
              z.string().url(),
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            ])
            .optional()
            .describe('Optional header image URL or base64-encoded image'),
          url: z.string().url().optional().describe('Optional related URL'),
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
          status: z
            .enum(['active', 'draft', 'deleted', 'obsolete'])
            .optional()
            .describe('Article status'),
          collectionId: z
            .number()
            .optional()
            .describe('Collection the article was added to'),
          self: z.string().describe('Link to created article').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const {
        draft,
        collectionId,
        images: imageInputs,
        headerImage,
        ...articleInput
      } = input;
      const imageFields = await uploadPostImages(
        api,
        imageInputs,
        headerImage,
        token,
      );
      const article = await api.createPost(
        {
          ...articleInput,
          ...imageFields,
          type: 'article',
          status: draft ? 'draft' : 'active',
        },
        { token },
      );
      if (collectionId !== undefined) {
        await api.addPostToCollection(collectionId, article.id, { token });
      }
      return {
        output: {
          ...article,
          ...(collectionId !== undefined ? { collectionId } : {}),
        },
      };
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
          draft: z
            .boolean()
            .optional()
            .describe('Whether to save the link as a draft'),
          collectionId: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Optional collection ID to add the link to'),
          images: z
            .array(
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            )
            .optional()
            .describe('Optional image files to upload and attach to the link'),
          headerImage: z
            .union([
              z.string().url(),
              z.object({
                base64: z
                  .string()
                  .min(1)
                  .describe('Base64-encoded image bytes'),
                mimeType: z.string().min(1).describe('Image MIME type'),
              }),
            ])
            .optional()
            .describe('Optional header image URL or base64-encoded image'),
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
          status: z
            .enum(['active', 'draft', 'deleted', 'obsolete'])
            .optional()
            .describe('Link status'),
          collectionId: z
            .number()
            .optional()
            .describe('Collection the link was added to'),
          self: z.string().describe('Link to created link').optional(),
        }),
    },
    action: async ({ input, credentials }) => {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'qeta',
      });
      const {
        draft,
        collectionId,
        images: imageInputs,
        headerImage,
        ...linkInput
      } = input;
      const imageFields = await uploadPostImages(
        api,
        imageInputs,
        headerImage,
        token,
      );
      const link = await api.createPost(
        {
          ...linkInput,
          ...imageFields,
          url: input.content,
          type: 'link',
          status: draft ? 'draft' : 'active',
        },
        { token },
      );
      if (collectionId !== undefined) {
        await api.addPostToCollection(collectionId, link.id, { token });
      }
      return {
        output: {
          ...link,
          ...(collectionId !== undefined ? { collectionId } : {}),
        },
      };
    },
  });
};
