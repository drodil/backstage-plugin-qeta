import { Request, Router } from 'express';
import {
  DeleteMetadataSchema,
  DraftQuestionSchema,
  EntitiesQuerySchema,
  RouteOptions,
  TagsQuerySchema,
  UsersQuerySchema,
} from '../types';
import { mapAdditionalFields } from '../util';
import { getCachedData } from './routeUtil';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import {
  filterTags,
  getSupportedEntityKinds,
  isValidTag,
  qetaCreateTagPermission,
  qetaDeleteTagPermission,
  qetaEditTagPermission,
  qetaReadAnswerPermission,
  qetaReadCollectionPermission,
  qetaReadCommentPermission,
  qetaReadPostPermission,
  qetaReadTagPermission,
  TagsQuery,
} from '@drodil/backstage-plugin-qeta-common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { eng, removeStopwords } from 'stopword';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const helperRoutes = (router: Router, options: RouteOptions) => {
  const {
    database,
    catalog,
    auth,
    config,
    httpAuth,
    auditor,
    logger,
    permissionMgr,
    aiHandler,
  } = options;

  const supportedKinds = getSupportedEntityKinds(config);

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
          fields: ['kind', 'metadata.name', 'metadata.namespace'],
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
      entityRefs = users.items
        .map(user => {
          try {
            return stringifyEntityRef(user);
          } catch (_e) {
            return null;
          }
        })
        .filter((e): e is string => e !== null);
    }

    const users = await database.getUsers({ entityRefs, ...request.query });
    response.json(users);
  });

  router.get('/users/followed', async (request, response) => {
    const username = await permissionMgr.getUsername(request, false);
    const key = `qeta:followed:users:${username}`;
    const ttl = 24 * 60 * 60 * 1000;
    const users = await getCachedData(
      options.cache,
      key,
      ttl,
      () => database.getFollowedUsers(username),
      options.logger,
    );
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

    await options.cache?.delete(`qeta:followed:users:${username}`);

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

    await options.cache?.delete(`qeta:followed:users:${username}`);

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

    await mapAdditionalFields(request, tags.tags, options, {
      checkRights: opts.checkAccess ?? false,
    });

    response.json(tags);
  });

  router.get('/tags/followed', async (request, response) => {
    const username = await permissionMgr.getUsername(request, false);
    const filter = await permissionMgr.getAuthorizeConditions(
      request,
      qetaReadTagPermission,
      { allowServicePrincipal: true },
    );
    const key = `qeta:followed:tags:${username}`;
    const ttl = 24 * 60 * 60 * 1000;
    const tags = await getCachedData(
      options.cache,
      key,
      ttl,
      () => database.getUserTags(username, filter),
      options.logger,
    );

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

    await options.cache?.delete(`qeta:followed:tags:${username}`);

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
    await options.cache?.delete(`qeta:followed:tags:${username}`);
    response.status(204).send();
  });

  const getSuggestedTags = async (
    request: Request,
    title: string,
    content: string,
    entities?: string[],
  ) => {
    const suggestedTags: string[] = [];
    if (entities && entities.length > 0) {
      try {
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await httpAuth.credentials(request),
          targetPluginId: 'catalog',
        });
        const entityResponse = await catalog.getEntitiesByRefs(
          {
            entityRefs: entities,
            fields: ['metadata.tags'],
            filter: {
              'metadata.tags': CATALOG_FILTER_EXISTS,
            },
          },
          { token },
        );
        const entityTags = entityResponse.items
          .flatMap(e => e?.metadata?.tags)
          .filter((t): t is string => !!t)
          .map(tag => tag.toLocaleLowerCase())
          .filter(filterTags)
          .slice(0, 5);
        suggestedTags.push(...entityTags);
      } catch (_error) {
        // Just ignore
      }
    }

    try {
      if (aiHandler?.suggestTags) {
        const { tags } = await aiHandler.suggestTags(title, content);
        suggestedTags.unshift(...tags);
        return [...new Set(suggestedTags)]
          .filter(filterTags)
          .map(tag => tag.toLocaleLowerCase())
          .slice(0, 10);
      }
    } catch (_error) {
      // NOOP: Fallback to database suggestions
    }

    const cleanWords = (words: string[]): string[] =>
      removeStopwords(words, [...eng]);

    const { tags: existingTags } = await database.getTags();

    const titleLower = title.toLocaleLowerCase();
    const titleWords = cleanWords(
      titleLower.split(/\s+/).map(word => word.toLocaleLowerCase()),
    );
    const contentLower = content.toLocaleLowerCase();
    const contentWords = cleanWords(
      contentLower.split(/\s+/).map(word => word.toLocaleLowerCase()),
    );

    existingTags.forEach(tag => {
      if (
        titleLower.includes(tag.tag.toLocaleLowerCase()) ||
        contentLower.includes(tag.tag.toLocaleLowerCase())
      ) {
        suggestedTags.push(tag.tag);
        return;
      }

      const descriptionWords = cleanWords(
        tag.description?.toLocaleLowerCase().split(/\s+/) || [],
      );

      if (
        titleWords.some(word => descriptionWords.includes(word)) ||
        contentWords.some(word => descriptionWords.includes(word))
      ) {
        suggestedTags.push(tag.tag);
      }
    });

    return [...new Set(suggestedTags)].filter(filterTags).slice(0, 10);
  };

  router.post('/tags/suggest', async (request, response) => {
    const validateRequestBody = ajv.compile(DraftQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response.status(400).send({ errors: validateRequestBody.errors });
      return;
    }

    try {
      const suggestedTags = await getSuggestedTags(
        request,
        request.body.title,
        request.body.content,
        request.body.entities,
      );

      const allTags = request.body.tags
        ? [...new Set([...request.body.tags, ...suggestedTags])]
        : suggestedTags;

      const uniqueTags = [...new Set(allTags)];

      response.json({ tags: uniqueTags });
    } catch (error) {
      logger.error(`Failed to generate tag suggestions: ${error}`);
      response
        .status(500)
        .json({ error: 'Failed to generate tag suggestions' });
    }
  });

  router.get('/tags/:tag', async (request, response) => {
    const tag = await database.getTag(request.params.tag);
    if (!tag) {
      response.sendStatus(404);
      return;
    }
    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadTagPermission, resource: tag }],
      { throwOnDeny: true },
    );
    await mapAdditionalFields(request, [tag], options);
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
    await permissionMgr.authorize(
      request,
      [{ permission: qetaEditTagPermission, resource: tag }],
      { throwOnDeny: true },
    );

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
    await mapAdditionalFields(request, resp ? [resp] : [], options);
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
    await permissionMgr.authorize(
      request,
      [{ permission: qetaCreateTagPermission }],
      { throwOnDeny: true },
    );

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
    await mapAdditionalFields(request, [tag], options);
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
    const validateRequestBody = ajv.compile(DeleteMetadataSchema);
    if (Number.isNaN(tagId) || !validateRequestBody(request.body)) {
      response.status(400).send({ errors: 'Invalid tag id', type: 'body' });
      return;
    }

    const tag = await database.getTagById(tagId);
    await permissionMgr.authorize(
      request,
      [{ permission: qetaDeleteTagPermission, resource: tag! }],
      { throwOnDeny: true },
    );
    const deleted = await database.deleteTag(tagId);

    if (deleted) {
      auditor?.createEvent({
        eventId: 'delete-tag',
        severityLevel: 'medium',
        request,
        meta: {
          tagId,
          reason: request.body.reason,
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
          filter: {
            kind: supportedKinds,
          },
          fields: ['kind', 'metadata.name', 'metadata.namespace'],
          fullTextFilter: {
            term: String(request.query.searchQuery),
            fields: [
              'metadata.name',
              'metadata.title',
              'metadata.description',
              'spec.profile.displayName',
            ],
          },
        },
        { token },
      );
      entityRefs = entities.items
        .map(entity => {
          try {
            return stringifyEntityRef(entity);
          } catch (_e) {
            return null;
          }
        })
        .filter((e): e is string => e !== null);
    }

    const entities = await database.getEntities({
      entityRefs,
      ...request.query,
    });
    response.json(entities);
  });

  router.post('/entities/suggest', async (request, response) => {
    const validateRequestBody = ajv.compile(DraftQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response.status(400).send({ errors: validateRequestBody.errors });
      return;
    }

    try {
      const suggestedTags = await getSuggestedTags(
        request,
        request.body.title,
        request.body.content,
        request.body.entities,
      );

      const allTags = request.body.tags
        ? [...new Set([...request.body.tags, ...suggestedTags])]
        : suggestedTags;

      if (!allTags.length) {
        response.json({ entities: [] });
        return;
      }

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(request),
        targetPluginId: 'catalog',
      });
      const entities = await catalog.queryEntities(
        {
          filter: {
            'metadata.tags': allTags,
            kind: supportedKinds,
          },
        },
        { token },
      );

      const notSetEntities = entities.items.filter(entity => {
        const ref = stringifyEntityRef(entity);
        return !request.body.entities?.includes(ref);
      });

      response.json({ entities: notSetEntities });
    } catch (error) {
      logger.error(`Failed to generate entity suggestions: ${error}`);
      response
        .status(500)
        .json({ error: 'Failed to generate entity suggestions' });
    }
  });

  router.get('/entities/followed', async (request, response) => {
    const username = await permissionMgr.getUsername(request, false);
    const key = `qeta:followed:entities:${username}`;
    const ttl = 24 * 60 * 60 * 1000;
    const entities = await getCachedData(
      options.cache,
      key,
      ttl,
      () => database.getUserEntities(username),
      options.logger,
    );
    response.json(entities);
  });

  router.get('/entities/links', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['service'],
    });
    if (!credentials) {
      response.sendStatus(401);
      return;
    }

    const links = await database.getEntityLinks();
    response.json(links);
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
    await options.cache?.delete(`qeta:followed:entities:${username}`);
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
    await options.cache?.delete(`qeta:followed:entities:${username}`);
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

  // GET /timeline
  router.get(`/timeline`, async (request, response) => {
    const username = await permissionMgr.getUsername(request, true);
    const limit = request.query.limit
      ? Number.parseInt(request.query.limit as string, 10)
      : 10;
    const offset = request.query.offset
      ? Number.parseInt(request.query.offset as string, 10)
      : 0;
    const includeTotal = request.query.includeTotal === 'true';

    const [filter, commentsFilter, answersFilter, collectionsFilter] =
      await Promise.all([
        permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
          allowServicePrincipal: true,
        }),
        permissionMgr.getAuthorizeConditions(
          request,
          qetaReadCommentPermission,
          {
            allowServicePrincipal: true,
          },
        ),
        permissionMgr.getAuthorizeConditions(
          request,
          qetaReadAnswerPermission,
          {
            allowServicePrincipal: true,
          },
        ),
        permissionMgr.getAuthorizeConditions(
          request,
          qetaReadCollectionPermission,
          {
            allowServicePrincipal: true,
          },
        ),
      ]);

    const timeline = await database.getTimeline(
      username,
      { limit, offset, includeTotal },
      {
        posts: filter,
        answers: answersFilter,
        comments: commentsFilter,
        collections: collectionsFilter,
      },
    );
    response.json(timeline);
  });
};
