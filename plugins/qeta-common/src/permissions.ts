import {
  BasicPermission,
  createPermission,
  isPermission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';

export const qetaCreatePostPermission = createPermission({
  name: 'qeta.create.post',
  attributes: { action: 'create' },
});

export const qetaCreateAnswerPermission = createPermission({
  name: 'qeta.create.answer',
  attributes: { action: 'create' },
});

export const qetaCreateCommentPermission = createPermission({
  name: 'qeta.create.comment',
  attributes: { action: 'create' },
});

export const POST_RESOURCE_TYPE = 'post';

export const qetaReadPostPermission = createPermission({
  name: 'qeta.read.post',
  attributes: { action: 'read' },
  resourceType: POST_RESOURCE_TYPE,
});

export const qetaEditPostPermission = createPermission({
  name: 'qeta.edit.post',
  attributes: { action: 'update' },
  resourceType: POST_RESOURCE_TYPE,
});

export const qetaDeletePostPermission = createPermission({
  name: 'qeta.delete.post',
  attributes: { action: 'delete' },
  resourceType: POST_RESOURCE_TYPE,
});

export const ANSWER_RESOURCE_TYPE = 'answer';
export const qetaReadAnswerPermission = createPermission({
  name: 'qeta.read.answer',
  attributes: { action: 'read' },
  resourceType: ANSWER_RESOURCE_TYPE,
});
export const qetaEditAnswerPermission = createPermission({
  name: 'qeta.edit.answer',
  attributes: { action: 'update' },
  resourceType: ANSWER_RESOURCE_TYPE,
});

export const qetaDeleteAnswerPermission = createPermission({
  name: 'qeta.delete.answer',
  attributes: { action: 'delete' },
  resourceType: ANSWER_RESOURCE_TYPE,
});

export const COMMENT_RESOURCE_TYPE = 'comment';
export const qetaReadCommentPermission = createPermission({
  name: 'qeta.read.comment',
  attributes: { action: 'read' },
  resourceType: COMMENT_RESOURCE_TYPE,
});
export const qetaEditCommentPermission = createPermission({
  name: 'qeta.edit.comment',
  attributes: { action: 'update' },
  resourceType: COMMENT_RESOURCE_TYPE,
});

export const qetaDeleteCommentPermission = createPermission({
  name: 'qeta.delete.comment',
  attributes: { action: 'delete' },
  resourceType: COMMENT_RESOURCE_TYPE,
});

export const TAG_RESOURCE_TYPE = 'tag';
export const qetaCreateTagPermission = createPermission({
  name: 'qeta.create.tag',
  attributes: { action: 'create' },
});
export const qetaReadTagPermission = createPermission({
  name: 'qeta.read.tag',
  attributes: { action: 'read' },
  resourceType: TAG_RESOURCE_TYPE,
});
export const qetaEditTagPermission = createPermission({
  name: 'qeta.edit.tag',
  attributes: { action: 'update' },
  resourceType: TAG_RESOURCE_TYPE,
});
export const qetaDeleteTagPermission = createPermission({
  name: 'qeta.delete.tag',
  attributes: { action: 'delete' },
  resourceType: TAG_RESOURCE_TYPE,
});

export const COLLECTION_RESOUCE_TYPE = 'collection';
export const qetaReadCollectionPermission = createPermission({
  name: 'qeta.read.collection',
  attributes: { action: 'read' },
  resourceType: COLLECTION_RESOUCE_TYPE,
});
export const qetaCreateCollectionPermission = createPermission({
  name: 'qeta.create.collection',
  attributes: { action: 'create' },
});
export const qetaEditCollectionPermission = createPermission({
  name: 'qeta.edit.collection',
  attributes: { action: 'update' },
  resourceType: COLLECTION_RESOUCE_TYPE,
});
export const qetaDeleteCollectionPermission = createPermission({
  name: 'qeta.delete.collection',
  attributes: { action: 'delete' },
  resourceType: COLLECTION_RESOUCE_TYPE,
});

export const qetaPermissions = [
  qetaReadPostPermission,
  qetaCreatePostPermission,
  qetaCreateAnswerPermission,
  qetaEditPostPermission,
  qetaDeletePostPermission,
  qetaReadAnswerPermission,
  qetaEditAnswerPermission,
  qetaDeleteAnswerPermission,
  qetaCreateCommentPermission,
  qetaReadCommentPermission,
  qetaEditCommentPermission,
  qetaDeleteCommentPermission,
  qetaCreateTagPermission,
  qetaReadTagPermission,
  qetaEditTagPermission,
  qetaDeleteTagPermission,
  qetaReadCollectionPermission,
  qetaCreateCollectionPermission,
  qetaEditCollectionPermission,
  qetaDeleteCollectionPermission,
];

export const qetaPostPermissions = [
  qetaReadPostPermission,
  qetaCreatePostPermission,
  qetaEditPostPermission,
  qetaDeletePostPermission,
];

export const qetaAnswerPermissions = [
  qetaReadAnswerPermission,
  qetaCreateAnswerPermission,
  qetaEditAnswerPermission,
  qetaDeleteAnswerPermission,
];

export const qetaCommentPermissions = [
  qetaCreateCommentPermission,
  qetaReadCommentPermission,
  qetaEditCommentPermission,
  qetaDeleteCommentPermission,
];

export const qetaTagPermissions = [
  qetaCreateTagPermission,
  qetaReadTagPermission,
  qetaEditTagPermission,
  qetaDeleteTagPermission,
];

export const qetaCollectionPermissions = [
  qetaReadCollectionPermission,
  qetaCreateCollectionPermission,
  qetaEditCollectionPermission,
  qetaDeleteCollectionPermission,
];

export const isQetaPermission = (
  permission: BasicPermission | ResourcePermission,
) => {
  return qetaPermissions.some(p => isPermission(permission, p));
};
