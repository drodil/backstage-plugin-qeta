import { Router } from 'express';
import { RouterOptions } from '../router';

export const helperRoutes = (router: Router, options: RouterOptions) => {
  const { database } = options;

  // GET /tags
  router.get('/tags', async (_request, response) => {
    const tags = await database.getTags();
    response.json(tags);
  });

  router.get('/entities', async (_request, response) => {
    const entities = await database.getEntities();
    response.json(entities);
  });
};
