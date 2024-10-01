import { Router } from 'express';
import { RouteOptions } from '../types';
import { getUsername } from '../util';
import { parseEntityRef } from '@backstage/catalog-model';

export const helperRoutes = (router: Router, options: RouteOptions) => {
  const { database } = options;

  const validateEntityRef = (entityRef: string) => {
    try {
      parseEntityRef(entityRef);
    } catch (error) {
      throw new Error(`Invalid entityRef: ${entityRef}`);
    }
  };

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

  router.get('/entities/followed', async (request, response) => {
    const username = await getUsername(request, options, false);
    const tags = await database.getUserEntities(username);
    response.json(tags);
  });

  router.put('/entities/follow/:entityRef(*)', async (request, response) => {
    const { entityRef } = request.params;
    validateEntityRef(entityRef);
    const username = await getUsername(request, options, false);
    await database.followEntity(username, entityRef);
    response.status(204).send();
  });

  router.delete('/entities/follow/:entityRef(*)', async (request, response) => {
    const { entityRef } = request.params;
    validateEntityRef(entityRef);
    const username = await getUsername(request, options, false);
    await database.unfollowEntity(username, entityRef);
    response.status(204).send();
  });
};
