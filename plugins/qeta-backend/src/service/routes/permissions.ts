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
import { AnswerOptions, PostOptions } from '../../database/QetaStore';

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
        getResources: async (resourceRefs: string[]) => {
          const postIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:post:')),
          );
          const opts: PostOptions = {
            includeComments: false,
            includeAnswers: false,
            includeVotes: false,
            includeAttachments: false,
            includeTags: false,
            includeEntities: false,
            includeTotal: false,
          };
          if (postIds.length === 1) {
            const post = await options.database.getPost(
              '',
              postIds[0],
              false,
              opts,
            );
            return [post];
          }
          const posts = await options.database.getPosts(
            '',
            { ids: postIds },
            undefined,
            opts,
          );
          return posts.posts;
        },
        resourceType: POST_RESOURCE_TYPE,
        permissions: qetaPostPermissions,
        rules: Object.values(postRules),
      },
      {
        getResources: async (resourceRefs: string[]) => {
          const answerIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:answer:')),
          );
          const opts: AnswerOptions = {
            includeVotes: false,
            includePost: false,
            includeComments: false,
          };

          if (answerIds.length === 1) {
            const answer = await options.database.getAnswer(
              answerIds[0],
              '',
              opts,
            );
            return [answer];
          }

          const answers = await options.database.getAnswers(
            '',
            {
              ids: answerIds,
            },
            undefined,
            opts,
          );
          return answers.answers;
        },
        resourceType: ANSWER_RESOURCE_TYPE,
        permissions: qetaAnswerPermissions,
        rules: Object.values(answerRules),
      },
      {
        getResources: async (resourceRefs: string[]) => {
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
        getResources: async (resourceRefs: string[]) => {
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
        getResources: async (resourceRefs: string[]) => {
          const tagIds = parseIdArray(
            resourceRefs.filter(ref => ref.startsWith('qeta:collection:')),
          );
          const collections = await options.database.getCollections(
            '',
            {
              ids: tagIds,
            },
            { includePosts: false },
          );
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
