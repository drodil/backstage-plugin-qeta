import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  Comment,
  COMMENT_RESOURCE_TYPE,
  Post,
  POST_RESOURCE_TYPE,
  qetaAnswerPermissions,
  qetaCollectionPermissions,
  qetaCommentPermissions,
  qetaPermissions,
  qetaPostPermissions,
  qetaTagPermissions,
  TAG_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerRules,
  collectionRules,
  commentRules,
  postRules,
  tagRules,
} from '../postRules';
import { Router } from 'express';
import { RouteOptions } from '../types';

export const permissionsRoute = (router: Router, options: RouteOptions) => {
  if (!options.permissions) {
    return;
  }

  const permissions = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
    // @ts-ignore: until 1.36.0 backstage release
    resources: [
      {
        getResources: async resourceRefs => {
          const postRefs = resourceRefs.filter(ref =>
            ref.startsWith('qeta:post:'),
          );

          const resources = await Promise.all(
            postRefs.map(async ref => {
              const id = ref.split(':')[2];
              const post = await options.database.getPost(
                '',
                Number.parseInt(id, 10),
                false,
              );
              return post === null ? undefined : (post as Post);
            }),
          );
          return resources.filter(Boolean);
        },
        resourceType: POST_RESOURCE_TYPE,
        permissions: qetaPostPermissions,
        rules: Object.values(postRules),
      },
      {
        getResources: async resourceRefs => {
          const answerRefs = resourceRefs.filter(ref =>
            ref.startsWith('qeta:answer:'),
          );

          const resources = await Promise.all(
            answerRefs.map(async ref => {
              const id = ref.split(':')[2];
              const answer = await options.database.getAnswer(
                Number.parseInt(id, 10),
                '',
              );
              return answer === null ? undefined : (answer as Answer);
            }),
          );
          return resources.filter(Boolean);
        },
        resourceType: ANSWER_RESOURCE_TYPE,
        permissions: qetaAnswerPermissions,
        rules: Object.values(answerRules),
      },
      {
        getResources: async resourceRefs => {
          const commentRefs = resourceRefs.filter(ref =>
            ref.startsWith('qeta:comment:'),
          );

          const resources = await Promise.all(
            commentRefs.map(async ref => {
              const id = Number.parseInt(ref.split(':')[2], 10);
              const comment =
                (await options.database.getPostComment(id)) ??
                (await options.database.getAnswerComment(id));
              return comment === null ? undefined : (comment as Comment);
            }),
          );
          return resources.filter(Boolean);
        },
        resourceType: COMMENT_RESOURCE_TYPE,
        permissions: qetaCommentPermissions,
        rules: Object.values(commentRules),
      },
      {
        getResources: async resourceRefs => {
          const tagRefs = resourceRefs.filter(ref =>
            ref.startsWith('qeta:tag:'),
          );

          const resources = await Promise.all(
            tagRefs.map(async ref => {
              const id = Number.parseInt(ref.split(':')[2], 10);
              const tag = await options.database.getTagById(id);
              return tag === null ? undefined : tag;
            }),
          );
          return resources.filter(Boolean);
        },
        resourceType: TAG_RESOURCE_TYPE,
        permissions: qetaTagPermissions,
        rules: Object.values(tagRules),
      },
      {
        getResources: async resourceRefs => {
          const entityRefs = resourceRefs.filter(ref =>
            ref.startsWith('qeta:collection:'),
          );

          const resources = await Promise.all(
            entityRefs.map(async ref => {
              const id = Number.parseInt(ref.split(':')[2], 10);
              const entity = await options.database.getCollection('', id);
              return entity === null ? undefined : entity;
            }),
          );
          return resources.filter(Boolean);
        },
        resourceType: COMMENT_RESOURCE_TYPE,
        permissions: qetaCollectionPermissions,
        rules: Object.values(collectionRules),
      },
    ],
  });

  router.use(permissions);
};
