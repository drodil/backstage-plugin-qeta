import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  Comment,
  COMMENT_RESOURCE_TYPE,
  Post,
  POST_RESOURCE_TYPE,
  qetaAnswerPermissions,
  qetaCommentPermissions,
  qetaPermissions,
  qetaPostPermissions,
} from '@drodil/backstage-plugin-qeta-common';
import { answerRules, commentRules, postRules } from '../postRules';
import { Router } from 'express';
import { RouteOptions } from '../types';

export const permissionsRoute = (router: Router, options: RouteOptions) => {
  if (!options.permissions) {
    return;
  }

  const permissions = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
    resources: [
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              if (!ref.startsWith('qeta:post:')) {
                return null;
              }
              const id = ref.split(':')[2];
              const post = await options.database.getPost(
                '',
                Number.parseInt(id, 10),
                false,
              );
              return post === null ? undefined : (post as Post);
            }),
          );
        },
        resourceType: POST_RESOURCE_TYPE,
        permissions: qetaPostPermissions,
        rules: Object.values(postRules),
      },
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              if (!ref.startsWith('qeta:answer:')) {
                return null;
              }
              const id = ref.split(':')[2];
              const answer = await options.database.getAnswer(
                Number.parseInt(id, 10),
                '',
              );
              return answer === null ? undefined : (answer as Answer);
            }),
          );
        },
        resourceType: ANSWER_RESOURCE_TYPE,
        permissions: qetaAnswerPermissions,
        rules: Object.values(answerRules),
      },
      {
        getResources: async resourceRefs => {
          return await Promise.all(
            resourceRefs.map(async ref => {
              if (!ref.startsWith('qeta:comment:')) {
                return null;
              }
              const id = Number.parseInt(ref.split(':')[2], 10);
              const comment =
                (await options.database.getAnswerComment(id)) ??
                (await options.database.getPostComment(id));
              return comment === null ? undefined : (comment as Comment);
            }),
          );
        },
        resourceType: COMMENT_RESOURCE_TYPE,
        permissions: qetaCommentPermissions,
        rules: Object.values(commentRules),
      },
    ],
  });

  router.use(permissions);
};
