import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const qetaRouteRef = createRouteRef({
  id: 'qeta',
});

export const askRouteRef = createSubRouteRef({
  id: 'qeta.ask',
  parent: qetaRouteRef,
  path: '/ask',
});

export const favoriteQuestionsRouteRef = createSubRouteRef({
  id: 'qeta.favoriteQuestions',
  parent: qetaRouteRef,
  path: '/questions/favorite',
});

export const statisticsRouteRef = createSubRouteRef({
  id: 'qeta.statistics',
  parent: qetaRouteRef,
  path: '/statistics',
});

export const questionsRouteRef = createSubRouteRef({
  id: 'qeta.questions',
  parent: qetaRouteRef,
  path: '/questions',
});

export const questionRouteRef = createSubRouteRef({
  id: 'qeta.question',
  parent: qetaRouteRef,
  path: '/questions/:id',
});

export const userRouteRef = createSubRouteRef({
  id: 'qeta.user',
  parent: qetaRouteRef,
  path: '/users/*',
});

export const editQuestionRouteRef = createSubRouteRef({
  id: 'qeta.editQuestion',
  parent: qetaRouteRef,
  path: '/questions/:id/edit',
});

export const tagsRouteRef = createSubRouteRef({
  id: 'qeta.tags',
  parent: qetaRouteRef,
  path: '/tags',
});

export const tagRouteRef = createSubRouteRef({
  id: 'qeta.tag',
  parent: qetaRouteRef,
  path: '/tags/:tag',
});
