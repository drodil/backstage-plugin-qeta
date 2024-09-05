import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';

export const createUnfollowTagAction = (options: {
  auth: AuthService;
  discovery: DiscoveryService;
}) => {
  return createTemplateAction<{
    tag: string;
  }>({
    id: 'qeta:tag:unfollow',
    description: 'Removes current user from following a tag in Q&A',
    schema: {
      input: {
        required: ['tag'],
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            title: 'Tag',
            description: 'Tag to unfollow',
          },
        },
      },
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { tag } = ctx.input;

      if (ctx.isDryRun) {
        ctx.logger.info(`DRY RUN: Unfollowing tag ${tag}`);
        return;
      }

      const { token } = await options.auth.getPluginRequestToken({
        onBehalfOf: await ctx.getInitiatorCredentials(),
        targetPluginId: 'qeta',
      });
      const baseUrl = options.discovery.getBaseUrl('qeta');
      await fetch(`${baseUrl}/tags/follow/${tag}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      ctx.logger.info(`Unfollowed Q&A tag ${tag}`);
    },
  });
};
