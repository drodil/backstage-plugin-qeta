import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'qeta',
});

export const askRouteRef = createSubRouteRef({
  id: 'qeta.ask',
  parent: rootRouteRef,
  path: '/ask',
});

export const favoriteQuestionsRouteRef = createSubRouteRef({
  id: 'qeta.favoriteQuestions',
  parent: rootRouteRef,
  path: '/questions/favorite',
});

export const statisticsRouteRef = createSubRouteRef({
  id: 'qeta.statistics',
  parent: rootRouteRef,
  path: '/statistics',
});

export const questionRouteRef = createSubRouteRef({
  id: 'qeta.question',
  parent: rootRouteRef,
  path: '/questions/:id',
});

export const userRouteRef = createSubRouteRef({
  id: 'qeta.user',
  parent: rootRouteRef,
  path: '/users/*',
});

export const editQuestionRouteRef = createSubRouteRef({
  id: 'qeta.editQuestion',
  parent: rootRouteRef,
  path: '/questions/:id/edit',
});

export const tagsRouteRef = createSubRouteRef({
  id: 'qeta.tags',
  parent: rootRouteRef,
  path: '/tags',
});

export const tagRouteRef = createSubRouteRef({
  id: 'qeta.tag',
  parent: rootRouteRef,
  path: '/tags/:tag',
});
