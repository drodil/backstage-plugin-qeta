import { createPermission } from '@backstage/plugin-permission-common';

export const qetaReadPermission = createPermission({
  name: 'qeta.read',
  attributes: { action: 'create' },
});

export const qetaCreateQuestionPermission = createPermission({
  name: 'qeta.create.question',
  attributes: { action: 'create' },
});

export const qetaCreateAnswerPermission = createPermission({
  name: 'qeta.create.answer',
  attributes: { action: 'create' },
});

export const qetaPermissions = [
  qetaReadPermission,
  qetaCreateQuestionPermission,
  qetaCreateAnswerPermission,
];
