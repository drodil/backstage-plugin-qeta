import { Router } from 'express';
import { RouterOptions } from '../router';

export const tagsRoutes = (router: Router, options: RouterOptions) => {
  const { database } = options;

  // GET /tags
  router.get('/tags', async (_request, response) => {
    const tags = await database.getTags();
    response.send(tags);
  });
};
