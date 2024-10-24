import {
  authorize,
  authorizeConditional,
  getCreated,
  getUsername,
  QetaFilters,
  transformConditions,
} from '../util';
import Ajv from 'ajv';
import { Router } from 'express';
import {
  qetaCreatePostPermission,
  qetaReadPostPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CollectionPostSchema,
  CollectionSchema,
  CollectionsQuerySchema,
  RouteOptions,
} from '../types';
import {
  AuthorizeResult,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const collectionsRoutes = (router: Router, options: RouteOptions) => {
  const { database, events } = options;
  // GET /collections
  router.get(`/collections`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options, true);
    const validateQuery = ajv.compile(CollectionsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const decision = await authorizeConditional(
      request,
      qetaReadPostPermission,
      options,
    );

    // Act
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      const filter: PermissionCriteria<QetaFilters> = transformConditions(
        decision.conditions,
      );
      const collections = await database.getCollections(
        username,
        request.query,
        filter,
      );
      response.json({
        collections: collections.collections,
        total: collections.total,
      });
    } else {
      const collections = await database.getCollections(
        username,
        request.query,
      );
      response.json({
        collections: collections.collections,
        total: collections.total,
      });
    }
  });

  // GET /posts/:id
  router.get(`/collections/:id`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }

    const decision = await authorizeConditional(
      request,
      qetaReadPostPermission,
      options,
    );

    let filter: PermissionCriteria<QetaFilters> | undefined;
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      filter = transformConditions(decision.conditions);
    }
    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
      filter,
    );

    if (collection === null) {
      response.sendStatus(404);
      return;
    }
    // Response
    response.json(collection);
  });

  // POST /collections
  router.post(`/collections`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(CollectionSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    await authorize(request, qetaCreatePostPermission, options);

    const username = await getUsername(request, options);
    const created = await getCreated(request, options);

    // Act
    const collection = await database.createCollection({
      user_ref: username,
      title: request.body.title,
      description: request.body.description,
      created,
      readAccess: request.body.readAccess,
      editAccess: request.body.editAccess,
      images: request.body.images,
      headerImage: request.body.headerImage,
    });

    if (!collection) {
      response
        .status(400)
        .send({ errors: 'Failed to create collection', type: 'body' });
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
        },
        metadata: { action: 'new_collection' },
      });
    }

    // Response
    response.status(201);
    response.json(collection);
  });

  // POST /collections/:id
  router.post(`/collections/:id`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(CollectionSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    let collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection?.canEdit) {
      response.sendStatus(401);
      return;
    }

    // Act
    collection = await database.updateCollection({
      id: collectionId,
      user_ref: username,
      title: request.body.title,
      description: request.body.description,
      readAccess: collection.canDelete ? request.body.readAccess : undefined,
      editAccess: collection.canDelete ? request.body.editAccess : undefined,
      images: request.body.images,
      headerImage: request.body.headerImage,
    });

    if (!collection) {
      response.sendStatus(401);
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
        },
        metadata: { action: 'update_collection' },
      });
    }

    // Response
    response.status(200);
    response.json(collection);
  });

  // DELETE /questions/:id
  router.delete('/collections/:id', async (request, response) => {
    // Validation

    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }
    const username = await getUsername(request, options);
    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection?.canDelete) {
      response.sendStatus(401);
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
        },
        metadata: { action: 'delete_collection' },
      });
    }

    // Act
    const deleted = await database.deleteCollection(collectionId);

    // Response
    response.sendStatus(deleted ? 200 : 404);
  });

  // POST /collections/:id
  router.post(`/collections/:id/posts`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(CollectionPostSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    let collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection?.canEdit) {
      response.sendStatus(401);
      return;
    }

    const decision = await authorizeConditional(
      request,
      qetaReadPostPermission,
      options,
    );
    let filter: PermissionCriteria<QetaFilters> | undefined;
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      filter = transformConditions(decision.conditions);
    }

    // Act
    collection = await database.addPostToCollection(
      username,
      collectionId,
      request.body.postId,
      filter,
    );

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
        },
        metadata: { action: 'update_collection' },
      });
    }

    // Response
    response.status(200);
    response.json(collection);
  });

  // DELETE /collections/:id/posts
  router.delete(`/collections/:id/posts`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(CollectionPostSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    let collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection?.canEdit) {
      response.sendStatus(401);
      return;
    }

    const decision = await authorizeConditional(
      request,
      qetaReadPostPermission,
      options,
    );
    let filter: PermissionCriteria<QetaFilters> | undefined;
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      filter = transformConditions(decision.conditions);
    }

    // Act
    collection = await database.removePostFromCollection(
      username,
      collectionId,
      request.body.postId,
      filter,
    );

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
        },
        metadata: { action: 'update_collection' },
      });
    }

    // Response
    response.status(200);
    response.json(collection);
  });
};
