import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  ANSWER_RESOURCE_TYPE,
  COLLECTION_RESOUCE_TYPE,
  COMMENT_RESOURCE_TYPE,
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
} from '@drodil/backstage-plugin-qeta-node';
import { Router } from 'express';
import { RouteOptions } from '../types';

export const permissionsRoute = (router: Router, options: RouteOptions) => {
  if (!options.permissions) {
    return;
  }

  const parseIdArray = (value: string[]) => {
    return value.map(v => Number.parseInt(v.split(':')[2], 10));
  };

  const permissions = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
    // @ts-ignore: until 1.36.0 backstage release
    resources: [
      {
        getResources: async resourceRefs => {
          const postIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:post:')),
          );
          const posts = await options.database.getPosts('', { ids: postIds });
          return posts.posts;
        },
        resourceType: POST_RESOURCE_TYPE,
        permissions: qetaPostPermissions,
        rules: Object.values(postRules),
      },
      {
        getResources: async resourceRefs => {
          const answerIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:answer:')),
          );
          const answers = await options.database.getAnswers('', {
            ids: answerIds,
          });
          return answers.answers;
        },
        resourceType: ANSWER_RESOURCE_TYPE,
        permissions: qetaAnswerPermissions,
        rules: Object.values(answerRules),
      },
      {
        getResources: async resourceRefs => {
          const commentIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:comment:')),
          );
          return await options.database.getComments({
            ids: commentIds,
          });
        },
        resourceType: COMMENT_RESOURCE_TYPE,
        permissions: qetaCommentPermissions,
        rules: Object.values(commentRules),
      },
      {
        getResources: async resourceRefs => {
          const tagIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:tag:')),
          );
          const tags = await options.database.getTags({ ids: tagIds });
          return tags.tags;
        },
        resourceType: TAG_RESOURCE_TYPE,
        permissions: qetaTagPermissions,
        rules: Object.values(tagRules),
      },
      {
        getResources: async resourceRefs => {
          const tagIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:collection:')),
          );
          const collections = await options.database.getCollections('', {
            ids: tagIds,
          });
          return collections.collections;
        },
        resourceType: COLLECTION_RESOUCE_TYPE,
        permissions: qetaCollectionPermissions,
        rules: Object.values(collectionRules),
      },
    ],
  });

  router.use(permissions);
};
