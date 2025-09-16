import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const qetaRouteRef = createRouteRef({
  id: 'qeta',
});

export const askRouteRef = createSubRouteRef({
  id: 'qeta.ask',
  parent: qetaRouteRef,
  path: '/questions/ask',
});

export const favoriteQuestionsRouteRef = createSubRouteRef({
  id: 'qeta.favoriteQuestions',
  parent: qetaRouteRef,
  path: '/favorites',
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

export const collectionsRouteRef = createSubRouteRef({
  id: 'qeta.collections',
  parent: qetaRouteRef,
  path: '/collections',
});

export const collectionRouteRef = createSubRouteRef({
  id: 'qeta.collection',
  parent: qetaRouteRef,
  path: '/collections/:id',
});

export const collectionCreateRouteRef = createSubRouteRef({
  id: 'qeta.collection.create',
  parent: qetaRouteRef,
  path: '/collections/create',
});

export const collectionEditRouteRef = createSubRouteRef({
  id: 'qeta.collection.edit',
  parent: qetaRouteRef,
  path: '/collections/:id/edit',
});

export const writeRouteRef = createSubRouteRef({
  id: 'qeta.write',
  parent: qetaRouteRef,
  path: '/articles/write',
});

export const articlesRouteRef = createSubRouteRef({
  id: 'qeta.articles',
  parent: qetaRouteRef,
  path: '/articles',
});

export const articleRouteRef = createSubRouteRef({
  id: 'qeta.article',
  parent: qetaRouteRef,
  path: '/articles/:id',
});

export const linksRouteRef = createSubRouteRef({
  id: 'qeta.links',
  parent: qetaRouteRef,
  path: '/links',
});

export const createLinkRouteRef = createSubRouteRef({
  id: 'qeta.createLink',
  parent: qetaRouteRef,
  path: '/links/create',
});

export const linkRouteRef = createSubRouteRef({
  id: 'qeta.link',
  parent: qetaRouteRef,
  path: '/links/:id',
});

export const usersRouteRef = createSubRouteRef({
  id: 'qeta.users',
  parent: qetaRouteRef,
  path: '/users',
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

export const editArticleRouteRef = createSubRouteRef({
  id: 'qeta.editArticle',
  parent: qetaRouteRef,
  path: '/articles/:id/edit',
});

export const editLinkRouteRef = createSubRouteRef({
  id: 'qeta.editLink',
  parent: qetaRouteRef,
  path: '/links/:id/edit',
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

export const entitiesRouteRef = createSubRouteRef({
  id: 'qeta.entities',
  parent: qetaRouteRef,
  path: '/entities',
});

export const entityRouteRef = createSubRouteRef({
  id: 'qeta.entity',
  parent: qetaRouteRef,
  path: '/entities/:entityRef',
});

export const moderatorRouteRef = createSubRouteRef({
  id: 'qeta.moderator',
  parent: qetaRouteRef,
  path: '/moderate',
});
