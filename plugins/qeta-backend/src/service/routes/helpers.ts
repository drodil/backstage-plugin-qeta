import { Router } from 'express';
import {
  EntitiesQuerySchema,
  RouteOptions,
  TagsQuerySchema,
  UsersQuerySchema,
} from '../types';
import { getUsername, isModerator } from '../util';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { isValidTag } from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const helperRoutes = (router: Router, options: RouteOptions) => {
  const { database, catalog, auth, httpAuth } = options;

  const validateEntityRef = (entityRef: string, kind?: string) => {
    try {
      const valid = parseEntityRef(entityRef);
      if (
        kind &&
        valid.kind.toLocaleLowerCase('en-US') !==
          kind.toLocaleLowerCase('en-US')
      ) {
        throw new Error(`Expected kind: ${kind}`);
      }
    } catch (error) {
      throw new Error(`Invalid entityRef: ${entityRef}`);
    }
  };

  router.get('/users', async (request, response) => {
    const validateQuery = ajv.compile(UsersQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    let entityRefs: string[] | undefined;
    if (request.query.searchQuery) {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(request),
        targetPluginId: 'catalog',
      });
      const users = await catalog.queryEntities(
        {
          filter: { kind: 'User' },
          fullTextFilter: {
            term: String(request.query.searchQuery),
            fields: [
              'metadata.name',
              'metadata.title',
              'spec.profile.displayName',
            ],
          },
        },
        { token },
      );
      entityRefs = users.items.map(user => stringifyEntityRef(user));
    }

    const users = await database.getUsers({ entityRefs, ...request.query });
    response.json(users);
  });

  router.get('/users/followed', async (request, response) => {
    const username = await getUsername(request, options, false);
    const users = await database.getFollowedUsers(username);
    response.json(users);
  });

  router.put('/users/follow/:userRef(*)', async (request, response) => {
    const { userRef } = request.params;
    validateEntityRef(userRef, 'user');
    const username = await getUsername(request, options, false);
    await database.followUser(username, userRef);
    response.status(204).send();
  });

  router.delete('/users/follow/:userRef(*)', async (request, response) => {
    const { userRef } = request.params;
    validateEntityRef(userRef, 'user');
    const username = await getUsername(request, options, false);
    await database.unfollowUser(username, userRef);
    response.status(204).send();
  });

  // GET /tags
  router.get('/tags', async (request, response) => {
    const validateQuery = ajv.compile(TagsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const tags = await database.getTags(request.query);
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

  router.get('/tags/:tag', async (request, response) => {
    const tag = await database.getTag(request.params.tag);
    if (!tag) {
      response.sendStatus(404);
      return;
    }
    response.json(tag);
  });

  router.post('/tags/:tag', async (request, response) => {
    const description = request.body.description;
    const tag = await database.updateTag(request.params.tag, description);
    if (!tag) {
      response.sendStatus(404);
      return;
    }
    response.json(tag);
  });

  router.put('/tags/:tag', async (request, response) => {
    const mod = await isModerator(request, options);
    if (!mod) {
      response.status(403).send({ errors: 'Not authorized', type: 'body' });
      return;
    }

    const existing = await database.getTag(request.params.tag);
    if (existing) {
      response.status(409).send({ errors: 'Tag already exists', type: 'body' });
      return;
    }

    if (!isValidTag(request.params.tag)) {
      response.status(400).send({ errors: 'Invalid tag', type: 'body' });
      return;
    }

    const description = request.body.description;
    const tag = await database.createTag(request.params.tag, description);
    console.log(tag);
    if (!tag) {
      response.sendStatus(500);
      return;
    }
    response.json(tag);
  });

  router.delete('/tags/:tag', async (request, response) => {
    const mod = await isModerator(request, options);
    if (!mod) {
      response.status(403).send({ errors: 'Not authorized', type: 'body' });
      return;
    }

    const tagId = Number.parseInt(request.params.tag, 10);
    if (Number.isNaN(tagId)) {
      response.status(400).send({ errors: 'Invalid tag id', type: 'body' });
      return;
    }

    const deleted = await database.deleteTag(tagId);

    // Response
    response.sendStatus(deleted ? 200 : 404);
  });

  router.get('/entities', async (request, response) => {
    const validateQuery = ajv.compile(EntitiesQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    let entityRefs: string[] | undefined;
    if (request.query.searchQuery) {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(request),
        targetPluginId: 'catalog',
      });
      const entities = await catalog.queryEntities(
        {
          fullTextFilter: {
            term: String(request.query.searchQuery),
            fields: ['metadata.name', 'metadata.title', 'metadata.description'],
          },
        },
        { token },
      );
      entityRefs = entities.items.map(user => stringifyEntityRef(user));
    }

    const entities = await database.getEntities({
      entityRefs,
      ...request.query,
    });
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

  router.get('/entities/:entityRef(*)', async (request, response) => {
    validateEntityRef(request.params.entityRef);
    const entity = await database.getEntity(request.params.entityRef);
    if (entity === null) {
      response.sendStatus(404);
      return;
    }
    response.json(entity);
  });
};
