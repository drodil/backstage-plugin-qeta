import { Router } from 'express';
import { RouteOptions } from '../types';

export const helperRoutes = (router: Router, options: RouteOptions) => {
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
