import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';

export const createFollowTagAction = (options: {
  auth: AuthService;
  discovery: DiscoveryService;
}) => {
  return createTemplateAction<{
    tag: string;
  }>({
    id: 'qeta:tag:follow',
    description: 'Sets current user to follow a tag in Q&A',
    schema: {
      input: {
        required: ['tag'],
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            title: 'Tag',
            description: 'Tag to follow',
          },
        },
      },
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { tag } = ctx.input;

      if (ctx.isDryRun) {
        ctx.logger.info(`DRY RUN: Following Q&A tag ${tag}`);
        return;
      }

      const { token } = await options.auth.getPluginRequestToken({
        onBehalfOf: await ctx.getInitiatorCredentials(),
        targetPluginId: 'qeta',
      });
      const baseUrl = options.discovery.getBaseUrl('qeta');
      await fetch(`${baseUrl}/tags/follow/${tag}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      ctx.logger.info(`Followed Q&A tag ${tag}`);
    },
  });
};
