import { Router } from 'express';
import { RouteOptions } from '../types';
import { getUsername } from '../util';

export const helperRoutes = (router: Router, options: RouteOptions) => {
  const { database } = options;

  // GET /tags
  router.get('/tags', async (_request, response) => {
    const tags = await database.getTags();
    response.json(tags);
  });

  router.get('/tags/followed', async (request, response) => {
    const username = await getUsername(request, options, false);
    const tags = await database.getUserTags(username);
    response.json(tags);
  });

  router.put('/tags/follow/:tag', async (request, response) => {
    const { tag } = request.params;
    const username = await getUsername(request, options, false);
    await database.followTag(username, tag);
    response.status(204).send();
  });

  router.delete('/tags/follow/:tag', async (request, response) => {
    const { tag } = request.params;
    const username = await getUsername(request, options, false);
    await database.unfollowTag(username, tag);
    response.status(204).send();
  });

  router.get('/entities', async (_request, response) => {
    const entities = await database.getEntities();
    response.json(entities);
  });
};
