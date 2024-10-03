import {
  BasicPermission,
  createPermission,
  isPermission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';

export const qetaCreateQuestionPermission = createPermission({
  name: 'qeta.create.question',
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

export const QUESTION_RESOURCE_TYPE = 'question';

export const qetaReadQuestionPermission = createPermission({
  name: 'qeta.read.question',
  attributes: { action: 'read' },
  resourceType: QUESTION_RESOURCE_TYPE,
});

export const qetaEditQuestionPermission = createPermission({
  name: 'qeta.edit.question',
  attributes: { action: 'update' },
  resourceType: QUESTION_RESOURCE_TYPE,
});

export const qetaDeleteQuestionPermission = createPermission({
  name: 'qeta.delete.question',
  attributes: { action: 'delete' },
  resourceType: QUESTION_RESOURCE_TYPE,
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
  qetaReadQuestionPermission,
  qetaCreateQuestionPermission,
  qetaCreateAnswerPermission,
  qetaEditQuestionPermission,
  qetaDeleteQuestionPermission,
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
