import { createPermissionResourceRef } from '@backstage/plugin-permission-node';
import {
  Answer,
  ANSWER_RESOURCE_TYPE,
  AnswerFilter,
  Collection,
  COLLECTION_RESOUCE_TYPE,
  CollectionFilter,
  Comment,
  COMMENT_RESOURCE_TYPE,
  CommentFilter,
  Post,
  POST_RESOURCE_TYPE,
  PostFilter,
  TAG_RESOURCE_TYPE,
  TagFilter,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';

export const postPermissionResourceRef = createPermissionResourceRef<
  Post,
  PostFilter
>().with({
  resourceType: POST_RESOURCE_TYPE,
  pluginId: 'qeta',
});

export const answerPermissionResourceRef = createPermissionResourceRef<
  Answer,
  AnswerFilter
>().with({
  resourceType: ANSWER_RESOURCE_TYPE,
  pluginId: 'qeta',
});

export const commentPermissionResourceRef = createPermissionResourceRef<
  Comment,
  CommentFilter
>().with({
  resourceType: COMMENT_RESOURCE_TYPE,
  pluginId: 'qeta',
});

export const tagPermissionResourceRef = createPermissionResourceRef<
  TagResponse,
  TagFilter
>().with({
  resourceType: TAG_RESOURCE_TYPE,
  pluginId: 'qeta',
});

export const collectionPermissionResourceRef = createPermissionResourceRef<
  Collection,
  CollectionFilter
>().with({
  resourceType: COLLECTION_RESOUCE_TYPE,
  pluginId: 'qeta',
});
