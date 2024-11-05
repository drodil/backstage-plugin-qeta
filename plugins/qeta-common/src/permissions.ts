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
  name: 'qeta.delete.question',
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
];

export const isQetaPermission = (
  permission: BasicPermission | ResourcePermission,
) => {
  return qetaPermissions.some(p => isPermission(permission, p));
};
