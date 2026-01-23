import { getCreated, mapAdditionalFields } from '../util';
import Ajv from 'ajv';
import { Router } from 'express';
import {
  CollectionsQuery,
  qetaCreateCollectionPermission,
  qetaDeleteCollectionPermission,
  qetaEditCollectionPermission,
  qetaReadCollectionPermission,
  qetaReadPostPermission,
  qetaReadTagPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CollectionPostSchema,
  CollectionRankPostSchema,
  CollectionSchema,
  CollectionsQuerySchema,
  DeleteMetadataSchema,
  RouteOptions,
} from '../types';
import { entityToJsonObject, validateDateRange, wrapAsync } from './util';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const collectionsRoutes = (router: Router, options: RouteOptions) => {
  const { database, events, notificationMgr, auditor, permissionMgr } = options;

  const notifyAutomaticPostAdditions = async (
    collectionId: number,
    username: string,
  ) => {
    const affectedPostIds = await database.syncCollectionToPosts(collectionId);
    if (affectedPostIds.length === 0) {
      return;
    }

    const [collection, followers] = await Promise.all([
      database.getCollection(username, collectionId),
      database.getUsersForCollection(collectionId),
    ]);

    if (collection) {
      await notificationMgr.onNewPostToCollection(
        username,
        collection,
        followers,
      );
    }
  };

  // GET /collections
  router.get(`/collections`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
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

    const conditions = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(
        request,
        qetaReadCollectionPermission,
        { allowServicePrincipal: true },
      ),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const postFilters = conditions[0];
    const filters = conditions[1];
    const tagFilters = conditions[2];

    const opts = request.query as CollectionsQuery;
    // Act
    const collections = await database.getCollections(username, opts, {
      filters,
      postFilters,
      tagFilters,
    });

    await mapAdditionalFields(request, collections.collections, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });

    response.json(collections);
  });

  router.post(`/collections/query`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(CollectionsQuerySchema);
    if (!validateQuery(request.body)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const validDate = validateDateRange(
      request.body.fromDate as string,
      request.body.toDate as string,
    );
    if (!validDate?.isValid) {
      response.status(400).send(validDate);
      return;
    }

    const [postFilters, filters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(
        request,
        qetaReadCollectionPermission,
        { allowServicePrincipal: true },
      ),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const opts = request.body;

    // Act
    const collections = await database.getCollections(username, opts, {
      filters,
      postFilters,
      tagFilters,
    });

    await mapAdditionalFields(request, collections.collections, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });

    response.json(collections);
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
    await permissionMgr.authorize(
      request,
      [{ permission: qetaCreateCollectionPermission }],
      { throwOnDeny: true },
    );

    const username = await permissionMgr.getUsername(request);
    const created = await getCreated(request, options);

    // Act
    const collection = await database.createCollection({
      user_ref: username,
      title: request.body.title,
      description: request.body.description,
      created,
      images: request.body.images,
      headerImage: request.body.headerImage,
      tags: request.body.tags,
      entities: request.body.entities,
      users: request.body.users,
      opts: { includePosts: false },
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

      await notifyAutomaticPostAdditions(collection.id, username);
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        collection,
        author: username,
      },
      metadata: { action: 'new_collection' },
    });

    await mapAdditionalFields(request, [collection], options, { username });

    auditor?.createEvent({
      eventId: 'create-collection',
      severityLevel: 'medium',
      request,
      meta: { collection: entityToJsonObject(collection) },
    });

    // Response
    response.status(201).json(collection);
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

    const username = await permissionMgr.getUsername(request);
    const originalCollection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!originalCollection) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        {
          permission: qetaEditCollectionPermission,
          resource: originalCollection,
        },
      ],
      { throwOnDeny: true },
    );

    const [postFilters, filters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(
        request,
        qetaReadCollectionPermission,
        { allowServicePrincipal: true },
      ),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    // Act
    const collection = await database.updateCollection({
      id: collectionId,
      user_ref: username,
      title: request.body.title,
      description: request.body.description,
      images: request.body.images,
      headerImage: request.body.headerImage,
      tags: request.body.tags,
      entities: request.body.entities,
      users: request.body.users,
      opts: { postFilters, tagFilters, filters },
    });

    if (!collection) {
      response.sendStatus(401);
      return;
    }

    wrapAsync(async () => {
      await notifyAutomaticPostAdditions(collection.id, username);
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        collection,
        author: username,
      },
      metadata: { action: 'update_collection' },
    });

    await mapAdditionalFields(request, [collection], options, { username });

    auditor?.createEvent({
      eventId: 'update-collection',
      severityLevel: 'medium',
      request,
      meta: {
        from: entityToJsonObject(originalCollection),
        to: entityToJsonObject(collection),
      },
    });

    // Response
    response.json(collection);
  });

  // DELETE /collections/:id
  router.delete('/collections/:id', async (request, response) => {
    // Validation
    const collectionId = Number.parseInt(request.params.id, 10);
    const validateRequestBody = ajv.compile(DeleteMetadataSchema);
    if (Number.isNaN(collectionId) || !validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }
    const username = await permissionMgr.getUsername(request);
    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(
      request,
      [{ permission: qetaDeleteCollectionPermission, resource: collection }],
      { throwOnDeny: true },
    );

    // Act
    const deleted = await database.deleteCollection(collectionId);

    if (deleted && events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          collection,
          author: username,
          reason: request.body.reason,
        },
        metadata: { action: 'delete_collection' },
      });
    }

    if (deleted) {
      notificationMgr.onCollectionDelete(
        username,
        collection,
        request.body.reason,
      );
      auditor?.createEvent({
        eventId: 'delete-collection',
        severityLevel: 'medium',
        request,
        meta: {
          collection: entityToJsonObject(collection),
          reason: request.body.reason,
        },
      });
    }

    // Response
    response.sendStatus(deleted ? 204 : 404);
  });

  router.get('/collections/followed', async (request, response) => {
    const username = await permissionMgr.getUsername(request, false);
    const [postFilters, filters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(
        request,
        qetaReadCollectionPermission,
        { allowServicePrincipal: true },
      ),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const collections = await database.getUserCollections(username, {
      filters,
      postFilters,
      tagFilters,
    });
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

    const username = await permissionMgr.getUsername(request, false);
    const collection = await database.getCollection(username, collectionId);
    if (!collection) {
      response.sendStatus(404);
      return;
    }
    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadCollectionPermission, resource: collection }],
      { throwOnDeny: true },
    );

    await database.followCollection(username, collectionId);

    auditor?.createEvent({
      eventId: 'follow-collection',
      severityLevel: 'low',
      request,
      meta: { collection: entityToJsonObject(collection) },
    });

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

    const username = await permissionMgr.getUsername(request, false);
    const collection = await database.getCollection(username, collectionId);
    if (!collection) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadCollectionPermission, resource: collection }],
      { throwOnDeny: true },
    );
    await database.unfollowCollection(username, collectionId);

    auditor?.createEvent({
      eventId: 'unfollow-collection',
      severityLevel: 'low',
      request,
      meta: { collection: entityToJsonObject(collection) },
    });

    response.status(204).send();
  });

  // GET /collections/:id
  router.get(`/collections/:id`, async (request, response) => {
    // Validation
    // Act
    const username = await permissionMgr.getUsername(request);
    const collectionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(collectionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid collection id', type: 'body' });
      return;
    }

    const [postFilters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
      { postFilters, tagFilters },
    );

    if (collection === null) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadCollectionPermission, resource: collection }],
      { throwOnDeny: true },
    );

    await mapAdditionalFields(request, [collection], options, { username });

    auditor?.createEvent({
      eventId: 'read-collection',
      severityLevel: 'low',
      request,
      meta: { collection: entityToJsonObject(collection) },
    });

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

    const username = await permissionMgr.getUsername(request);
    let collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    const post = await database.getPost(username, request.body.postId, false);
    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaEditCollectionPermission, resource: collection! },
        { permission: qetaReadPostPermission, resource: post },
      ],
      { throwOnDeny: true },
    );

    const [postFilters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    // Act
    collection = await database.addPostToCollection(
      username,
      collectionId,
      request.body.postId,
      { postFilters, tagFilters },
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

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        collection,
        author: username,
      },
      metadata: { action: 'update_collection' },
    });

    await mapAdditionalFields(request, [collection], options, { username });

    auditor?.createEvent({
      eventId: 'add-to-collection',
      severityLevel: 'low',
      request,
      meta: {
        collection: entityToJsonObject(collection),
        post: entityToJsonObject(post),
      },
    });

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

    const username = await permissionMgr.getUsername(request);
    let collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    const post = await database.getPost(username, request.body.postId, false);
    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaEditCollectionPermission, resource: collection! },
        { permission: qetaReadPostPermission, resource: post },
      ],
      { throwOnDeny: true },
    );

    const [postFilters, tagFilters] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    // Act
    collection = await database.removePostFromCollection(
      username,
      collectionId,
      request.body.postId,
      { postFilters, tagFilters },
    );

    if (!collection) {
      response
        .status(404)
        .send({ errors: 'Collection not found', type: 'body' });
      return;
    }

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        collection,
        author: username,
      },
      metadata: { action: 'update_collection' },
    });

    await mapAdditionalFields(request, [collection], options, { username });

    auditor?.createEvent({
      eventId: 'delete-from-collection',
      severityLevel: 'low',
      request,
      meta: {
        collection: entityToJsonObject(collection),
        post: entityToJsonObject(post),
      },
    });

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

    const username = await permissionMgr.getUsername(request);
    const collection = await database.getCollection(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!collection) {
      response.sendStatus(404);
      return;
    }

    const post = await database.getPost(username, request.body.postId, false);

    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaEditCollectionPermission, resource: collection },
        { permission: qetaReadPostPermission, resource: post },
      ],
      { throwOnDeny: true },
    );

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

    auditor?.createEvent({
      eventId: 'rank-collection',
      severityLevel: 'low',
      request,
      meta: {
        collection: entityToJsonObject(collection),
        post: entityToJsonObject(post),
        rank: request.body.rank,
      },
    });

    response.sendStatus(200);
  });
};
