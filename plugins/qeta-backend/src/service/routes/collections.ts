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
  CollectionRankPostSchema,
  CollectionSchema,
  CollectionsQuerySchema,
  RouteOptions,
} from '../types';
import {
  AuthorizeResult,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';
import { validateDateRange, wrapAsync } from './util';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const collectionsRoutes = (router: Router, options: RouteOptions) => {
  const { database, events, notificationMgr } = options;
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

    const validDate = validateDateRange(
      request.query.fromDate as string,
      request.query.toDate as string,
    );
    if (!validDate?.isValid) {
      response.status(400).send(validDate);
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

    wrapAsync(async () => {
      const followingUsers = await Promise.all([
        database.getFollowingUsers(username),
      ]);
      await notificationMgr.onNewCollection(
        username,
        collection,
        followingUsers.flat(),
      );
    });

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

  router.get('/collections/followed', async (request, response) => {
    const username = await getUsername(request, options, false);
    const decision = await authorizeConditional(
      request,
      qetaReadPostPermission,
      options,
    );

    let filter: PermissionCriteria<QetaFilters> | undefined;
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      filter = transformConditions(decision.conditions);
    }

    const collections = await database.getUserCollections(username, filter);
    response.json(collections);
  });

  router.put('/collections/follow/:id', async (request, response) => {
    const { id } = request.params;
    const collectionId = Number.parseInt(id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
    }

    const username = await getUsername(request, options, false);
    await database.followCollection(username, collectionId);
    response.status(204).send();
  });

  router.delete('/collections/follow/:id', async (request, response) => {
    const { id } = request.params;
    const collectionId = Number.parseInt(id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
    }

    const username = await getUsername(request, options, false);
    await database.unfollowCollection(username, collectionId);
    response.status(204).send();
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

    if (!collection) {
      response.sendStatus(404);
      return;
    }

    wrapAsync(async () => {
      if (!collection) {
        return;
      }
      const followingUsers = await Promise.all([
        database.getUsersForCollection(collectionId),
        database.getFollowingUsers(username),
      ]);
      await notificationMgr.onNewPostToCollection(
        username,
        collection,
        followingUsers.flat(),
      );
    });

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

  router.post('/collections/:id/rank/', async (request, response) => {
    const validateRequestBody = ajv.compile(CollectionRankPostSchema);
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
    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection?.canEdit) {
      response.sendStatus(401);
      return;
    }

    const post = await database.getPost(username, request.body.postId, false);

    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await authorize(request, qetaReadPostPermission, options, post);

    const currentRank = await database.getPostRank(
      collection.id,
      request.body.postId,
    );
    if (!currentRank) {
      response.status(404).send();
      return;
    }

    if (request.body.rank === 'up') {
      const higherRankPostId = await database.getNextRankedPostId(
        collection.id,
        request.body.postId,
      );
      if (higherRankPostId) {
        await database.updatePostRank(
          collection.id,
          higherRankPostId.postId,
          currentRank,
        );
        await database.updatePostRank(
          collection.id,
          request.body.postId,
          higherRankPostId.rank,
        );
      }
    } else if (request.body.rank === 'down') {
      const lowerRankPostId = await database.getPreviousRankedPostId(
        collection.id,
        request.body.postId,
      );
      if (lowerRankPostId) {
        await database.updatePostRank(
          collection.id,
          lowerRankPostId.postId,
          currentRank,
        );
        await database.updatePostRank(
          collection.id,
          request.body.postId,
          lowerRankPostId.rank,
        );
      }
    } else if (request.body.rank === 'top') {
      const topRankPostId = await database.getTopRankedPostId(collectionId);
      if (topRankPostId) {
        await database.updatePostRank(
          collection.id,
          topRankPostId.postId,
          currentRank,
        );
        await database.updatePostRank(
          collection.id,
          request.body.postId,
          topRankPostId.rank,
        );
      }
    } else if (request.body.rank === 'bottom') {
      const bottomRankPostId = await database.getBottomRankedPostId(
        collection.id,
      );
      if (bottomRankPostId) {
        await database.updatePostRank(
          collection.id,
          bottomRankPostId.postId,
          currentRank,
        );
        await database.updatePostRank(
          collection.id,
          request.body.postId,
          bottomRankPostId.rank,
        );
      }
    }
    response.sendStatus(200);
  });
};
