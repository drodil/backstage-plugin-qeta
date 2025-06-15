import { Router } from 'express';
import {
  EntitiesQuerySchema,
  RouteOptions,
  TagsQuerySchema,
  UsersQuerySchema,
} from '../types';
import { mapAdditionalFields } from '../util';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import {
  isValidTag,
  qetaCreateTagPermission,
  qetaDeleteTagPermission,
  qetaEditTagPermission,
  qetaReadTagPermission,
  TagsQuery,
} from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const helperRoutes = (router: Router, options: RouteOptions) => {
  const { database, catalog, auth, httpAuth, auditor, permissionMgr } = options;

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
    const username = await permissionMgr.getUsername(request, false);
    const users = await database.getFollowedUsers(username);
    response.json(users);
  });

  router.put('/users/follow/:userRef(*)', async (request, response) => {
    const { userRef } = request.params;
    validateEntityRef(userRef, 'user');
    const username = await permissionMgr.getUsername(request, false);
    await database.followUser(username, userRef);

    auditor?.createEvent({
      eventId: 'follow-user',
      severityLevel: 'low',
      request,
      meta: {
        userRef,
      },
    });

    response.status(204).send();
  });

  router.delete('/users/follow/:userRef(*)', async (request, response) => {
    const { userRef } = request.params;
    validateEntityRef(userRef, 'user');
    const username = await permissionMgr.getUsername(request, false);
    await database.unfollowUser(username, userRef);

    auditor?.createEvent({
      eventId: 'unfollow-user',
      severityLevel: 'low',
      request,
      meta: {
        userRef,
      },
    });

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

    const filter = await permissionMgr.getAuthorizeConditions(
      request,
      qetaReadTagPermission,
      { allowServicePrincipal: true },
    );

    const opts = request.query as TagsQuery;
    const tags = await database.getTags(opts, filter);

    await Promise.all(
      tags.tags.map(async tag => {
        await mapAdditionalFields(request, tag, options, {
          checkRights: opts.checkAccess ?? false,
        });
      }),
    );

    response.json(tags);
  });

  router.get('/tags/followed', async (request, response) => {
    const username = await permissionMgr.getUsername(request, false);
    const filter = await permissionMgr.getAuthorizeConditions(
      request,
      qetaReadTagPermission,
      { allowServicePrincipal: true },
    );
    const tags = await database.getUserTags(username, filter);

    response.json(tags);
  });

  router.put('/tags/follow/:tag', async (request, response) => {
    const { tag } = request.params;
    const username = await permissionMgr.getUsername(request, false);
    await database.followTag(username, tag);

    auditor?.createEvent({
      eventId: 'follow-tag',
      severityLevel: 'low',
      request,
      meta: {
        tag,
      },
    });

    response.status(204).send();
  });

  router.delete('/tags/follow/:tag', async (request, response) => {
    const { tag } = request.params;
    const username = await permissionMgr.getUsername(request, false);
    await database.unfollowTag(username, tag);

    auditor?.createEvent({
      eventId: 'unfollow-tag',
      severityLevel: 'low',
      request,
      meta: {
        tag,
      },
    });
    response.status(204).send();
  });

  router.get('/tags/:tag', async (request, response) => {
    const tag = await database.getTag(request.params.tag);
    if (!tag) {
      response.sendStatus(404);
      return;
    }
    await permissionMgr.authorize(request, qetaReadTagPermission, {
      resource: tag,
    });
    await mapAdditionalFields(request, tag, options);
    auditor?.createEvent({
      eventId: 'read-tag',
      severityLevel: 'low',
      request,
      meta: { tagId: tag.id, tag: tag.tag },
    });
    response.json(tag);
  });

  router.post('/tags/:tag', async (request, response) => {
    const tagId = Number.parseInt(request.params.tag, 10);
    if (Number.isNaN(tagId)) {
      response.status(400).send({ errors: 'Invalid tag id', type: 'body' });
      return;
    }

    const tag = await database.getTagById(tagId);
    if (!tag) {
      response.sendStatus(404);
      return;
    }
    await permissionMgr.authorize(request, qetaEditTagPermission, {
      resource: tag,
    });

    const description = request.body.description;
    const experts = request.body.experts;
    if (experts) {
      const isMod = await permissionMgr.isModerator(request);
      if (!isMod) {
        response.sendStatus(401);
        return;
      }
    }
    const resp = await database.updateTag(tagId, description, experts);
    await mapAdditionalFields(request, resp, options);
    auditor?.createEvent({
      eventId: 'update-tag',
      severityLevel: 'medium',
      request,
      meta: {
        ...resp,
        tagId: tag.id,
      },
    });

    response.json(resp);
  });

  router.put('/tags', async (request, response) => {
    await permissionMgr.authorize(request, qetaCreateTagPermission);

    const existing = await database.getTag(request.body.tag);
    if (existing) {
      response.status(409).send({ errors: 'Tag already exists', type: 'body' });
      return;
    }

    if (!isValidTag(request.body.tag)) {
      response.status(400).send({ errors: 'Invalid tag', type: 'body' });
      return;
    }

    const description = request.body.description;
    const experts = request.body.experts;
    if (experts) {
      const isMod = await permissionMgr.isModerator(request);
      if (!isMod) {
        response.sendStatus(401);
        return;
      }
    }

    const tag = await database.createTag(
      request.body.tag,
      description,
      experts,
    );
    if (!tag) {
      response.sendStatus(500);
      return;
    }
    await mapAdditionalFields(request, tag, options);
    auditor?.createEvent({
      eventId: 'create-tag',
      severityLevel: 'medium',
      request,
      meta: {
        ...tag,
        tagId: tag.id,
      },
    });
    response.status(201).json(tag);
  });

  router.delete('/tags/:tag', async (request, response) => {
    const tagId = Number.parseInt(request.params.tag, 10);
    if (Number.isNaN(tagId)) {
      response.status(400).send({ errors: 'Invalid tag id', type: 'body' });
      return;
    }

    const tag = await database.getTagById(tagId);
    await permissionMgr.authorize(request, qetaDeleteTagPermission, {
      resource: tag,
    });
    const deleted = await database.deleteTag(tagId);

    if (deleted) {
      auditor?.createEvent({
        eventId: 'delete-tag',
        severityLevel: 'medium',
        request,
        meta: {
          tagId,
        },
      });
    }
    // Response
    response.sendStatus(deleted ? 204 : 404);
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
    const username = await permissionMgr.getUsername(request, false);
    const tags = await database.getUserEntities(username);
    response.json(tags);
  });

  router.put('/entities/follow/:entityRef(*)', async (request, response) => {
    const { entityRef } = request.params;
    validateEntityRef(entityRef);
    const username = await permissionMgr.getUsername(request, false);
    await database.followEntity(username, entityRef);
    auditor?.createEvent({
      eventId: 'follow-entity',
      severityLevel: 'low',
      request,
      meta: {
        entityRef,
      },
    });
    response.status(204).send();
  });

  router.delete('/entities/follow/:entityRef(*)', async (request, response) => {
    const { entityRef } = request.params;
    validateEntityRef(entityRef);
    const username = await permissionMgr.getUsername(request, false);
    await database.unfollowEntity(username, entityRef);
    auditor?.createEvent({
      eventId: 'unfollow-entity',
      severityLevel: 'low',
      request,
      meta: {
        entityRef,
      },
    });
    response.status(204).send();
  });

  router.get('/entities/:entityRef(*)', async (request, response) => {
    validateEntityRef(request.params.entityRef);
    const entity = await database.getEntity(request.params.entityRef);
    if (entity === null) {
      response.sendStatus(404);
      return;
    }
    auditor?.createEvent({
      eventId: 'read-entity',
      severityLevel: 'low',
      request,
      meta: { entityRef: request.params.entityRef },
    });
    response.json(entity);
  });
};
