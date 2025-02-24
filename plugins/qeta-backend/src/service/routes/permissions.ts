import {
  qetaAnswerPermissions,
  qetaCollectionPermissions,
  qetaCommentPermissions,
  qetaPostPermissions,
  qetaTagPermissions,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerPermissionResourceRef,
  answerRules,
  collectionPermissionResourceRef,
  collectionRules,
  commentPermissionResourceRef,
  commentRules,
  postPermissionResourceRef,
  postRules,
  tagPermissionResourceRef,
  tagRules,
} from '@drodil/backstage-plugin-qeta-node';
import { Router } from 'express';
import { RouteOptions } from '../types';
import { AnswerOptions, PostOptions } from '../../database/QetaStore';

export const permissionsRoute = (_router: Router, options: RouteOptions) => {
  const { permissions, permissionsRegistry, logger } = options;
  if (!permissions) {
    logger.info(
      `Permissions not enabled, skipping setting up permissions registry`,
    );
    return;
  }

  if (!permissionsRegistry) {
    logger.error(
      `Permissions are enabled but permissions registry is missing; are you running Backstage version 1.36.0 or later?`,
    );
    return;
  }

  const parseIdArray = (value: string[]) => {
    return value.map(v => Number.parseInt(v.split(':')[2], 10));
  };

  permissionsRegistry.addResourceType({
    resourceRef: postPermissionResourceRef,
    getResources: async (resourceRefs: string[]) => {
      const postIds = parseIdArray(
        resourceRefs.filter(ref => ref.startsWith('qeta:post:')),
      );

      if (postIds.length === 0) {
        return [];
      }

      const opts: PostOptions = {
        includeComments: false,
        includeAnswers: false,
        includeVotes: false,
        includeAttachments: false,
        includeTags: false,
        includeEntities: false,
        includeTotal: false,
      };

      const posts = await options.database.getPosts(
        '',
        { ids: postIds },
        undefined,
        opts,
      );
      return posts.posts;
    },
    permissions: qetaPostPermissions,
    rules: Object.values(postRules),
  });

  permissionsRegistry.addResourceType({
    resourceRef: answerPermissionResourceRef,
    getResources: async (resourceRefs: string[]) => {
      const answerIds = parseIdArray(
        resourceRefs.filter(ref => ref.startsWith('qeta:answer:')),
      );
      if (answerIds.length === 0) {
        return [];
      }

      const opts: AnswerOptions = {
        includeVotes: false,
        includePost: false,
        includeComments: false,
      };

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
    permissions: qetaAnswerPermissions,
    rules: Object.values(answerRules),
  });

  permissionsRegistry.addResourceType({
    resourceRef: commentPermissionResourceRef,
    getResources: async (resourceRefs: string[]) => {
      const commentIds = parseIdArray(
        resourceRefs.filter(ref => ref.startsWith('qeta:comment:')),
      );

      if (commentIds.length === 0) {
        return [];
      }

      return await options.database.getComments({
        ids: commentIds,
      });
    },
    permissions: qetaCommentPermissions,
    rules: Object.values(commentRules),
  });

  permissionsRegistry.addResourceType({
    resourceRef: tagPermissionResourceRef,
    getResources: async (resourceRefs: string[]) => {
      const tagIds = parseIdArray(
        resourceRefs.filter(ref => ref.startsWith('qeta:tag:')),
      );
      if (tagIds.length === 0) {
        return [];
      }
      const tags = await options.database.getTags({ ids: tagIds });
      return tags.tags;
    },
    permissions: qetaTagPermissions,
    rules: Object.values(tagRules),
  });

  permissionsRegistry.addResourceType({
    resourceRef: collectionPermissionResourceRef,
    getResources: async (resourceRefs: string[]) => {
      const tagIds = parseIdArray(
        resourceRefs.filter(ref => ref.startsWith('qeta:collection:')),
      );
      if (tagIds.length === 0) {
        return [];
      }
      const collections = await options.database.getCollections(
        '',
        {
          ids: tagIds,
        },
        { includePosts: false },
      );
      return collections.collections;
    },
    permissions: qetaCollectionPermissions,
    rules: Object.values(collectionRules),
  });
};
