import { getCreated, mapAdditionalFields } from '../util';
import Ajv from 'ajv';
import { Request, Router } from 'express';
import {
  findUserMentions,
  PostsQuery,
  qetaCreateCommentPermission,
  qetaCreatePostPermission,
  qetaDeleteCommentPermission,
  qetaDeletePostPermission,
  qetaEditCommentPermission,
  qetaEditPostPermission,
  qetaReadAnswerPermission,
  qetaReadCommentPermission,
  qetaReadPostPermission,
  qetaReadTagPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CommentSchema,
  PostSchema,
  PostsQuerySchema,
  RouteOptions,
} from '../types';
import { Response } from 'express-serve-static-core';
import {
  entityToJsonObject,
  signalPostStats,
  validateDateRange,
  wrapAsync,
} from './util';
import { getEntities, getTags } from './routeUtil';
import { PostOptions } from '../../database/QetaStore';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const postsRoutes = (router: Router, options: RouteOptions) => {
  const {
    database,
    events,
    config,
    signals,
    notificationMgr,
    auditor,
    permissionMgr,
  } = options;

  const getPostFilters = async (request: Request, opts: PostOptions) => {
    return await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadPostPermission, {
        allowServicePrincipal: true,
      }),
      opts.includeTags
        ? permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
            allowServicePrincipal: true,
          })
        : undefined,
      opts.includeComments
        ? permissionMgr.getAuthorizeConditions(
            request,
            qetaReadCommentPermission,
            { allowServicePrincipal: true },
          )
        : undefined,
      opts.includeAnswers
        ? permissionMgr.getAuthorizeConditions(
            request,
            qetaReadAnswerPermission,
            { allowServicePrincipal: true },
          )
        : undefined,
    ]);
  };

  // GET /posts
  router.get(`/posts`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(PostsQuerySchema);
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

    const opts = request.query as PostsQuery;

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, opts);

    // Act
    const posts = await database.getPosts(username, opts, filter, {
      tagsFilter,
      commentsFilter,
      answersFilter,
      includeAnswers: false,
      includeComments: false,
      includeAttachments: false,
    });
    await Promise.all(
      posts.posts.map(async post => {
        await mapAdditionalFields(request, post, options, {
          checkRights: opts.checkAccess ?? false,
        });
      }),
    );
    response.json(posts);
  });

  router.post(`/posts/query`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(PostsQuerySchema);
    if (!validateQuery(request.body)) {
      response.status(400).send({ errors: validateQuery.errors, type: 'body' });
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

    const opts = request.body;

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, opts);

    // Act
    const posts = await database.getPosts(username, opts, filter, {
      tagsFilter,
      commentsFilter,
      answersFilter,
      includeAnswers: false,
      includeComments: false,
      includeAttachments: false,
    });
    await Promise.all(
      posts.posts.map(async post => {
        await mapAdditionalFields(request, post, options, {
          checkRights: opts.checkAccess ?? false,
        });
      }),
    );
    response.json(posts);
  });

  // GET /posts/list/:type
  router.get(`/posts/list/:type`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(PostsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const optionOverride: PostsQuery = {};
    const type = request.params.type;
    if (type === 'unanswered') {
      optionOverride.random = true;
      optionOverride.noAnswers = true;
    } else if (type === 'incorrect') {
      optionOverride.noCorrectAnswer = true;
      optionOverride.random = true;
    } else if (type === 'hot') {
      optionOverride.includeTrend = true;
      optionOverride.orderBy = 'trend';
    } else if (type === 'own') {
      optionOverride.author = username;
    }
    const opts = { ...request.query, ...optionOverride };

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, opts);

    // Act
    const posts = await database.getPosts(username, opts, filter, {
      includeTotal: false,
      includeAnswers: false,
      includeAttachments: false,
      includeEntities: false,
      includeTags: false,
      includeVotes: false,
      includeComments: false,
      commentsFilter,
      tagsFilter,
      answersFilter,
    });

    await Promise.all(
      posts.posts.map(async post => {
        await mapAdditionalFields(request, post, options, {
          checkRights: opts.checkAccess ?? false,
        });
      }),
    );
    response.json(posts);
  });

  // GET /posts/:id
  router.get(`/posts/:id`, async (request, response) => {
    // Validation
    // Act
    const username = await permissionMgr.getUsername(request);
    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const [tagsFilter, commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      true,
      { tagsFilter, commentsFilter, answersFilter },
    );

    if (post === null) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });

    await mapAdditionalFields(request, post, options);
    signalPostStats(signals, post);

    auditor?.createEvent({
      eventId: 'read-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });

    // Response
    response.json(post);
  });

  // POST /posts/:id/comments
  router.post(`/posts/:id/comments`, async (request, response) => {
    // Validation
    // Act
    const username = await permissionMgr.getUsername(request);
    const created = await getCreated(request, options);
    const validateRequestBody = ajv.compile(CommentSchema);
    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });
    await permissionMgr.authorize(request, qetaCreateCommentPermission);

    const [tagsFilter, commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    post = await database.commentPost(
      questionId,
      username,
      request.body.content,
      created,
      { tagsFilter, commentsFilter, answersFilter },
    );

    if (post === null) {
      response
        .status(400)
        .send({ errors: 'Failed to comment post', type: 'body' });
      return;
    }

    await mapAdditionalFields(request, post, options);

    wrapAsync(async () => {
      if (!post) {
        return;
      }
      const followingUsers = await Promise.all([
        database.getUsersForTags(post.tags),
        database.getUsersForEntities(post.entities),
        database.getFollowingUsers(username),
        database.getUsersWhoFavoritedPost(post.id),
      ]);

      const sent = await notificationMgr.onNewPostComment(
        username,
        post,
        request.body.content,
        followingUsers.flat(),
      );
      const mentions = findUserMentions(request.body.content);
      if (mentions.length > 0) {
        await notificationMgr.onMention(username, post, mentions, sent, true);
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        question: post,
        comment: request.body.content,
        author: username,
      },
      metadata: { action: 'comment_post' },
    });

    auditor?.createEvent({
      eventId: 'comment-post',
      severityLevel: 'medium',
      request,
      meta: { post: entityToJsonObject(post), comment: request.body.content },
    });

    // Response
    response.status(201).json(post);
  });

  // POST /posts/:id/comments/:commentId
  router.post(`/posts/:id/comments/:commentId`, async (request, response) => {
    // Validation
    // Act
    const postId = Number.parseInt(request.params.id, 10);
    const commentId = Number.parseInt(request.params.commentId, 10);
    if (Number.isNaN(postId) || Number.isNaN(commentId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const comment = await database.getComment(commentId, { postId });

    if (!comment) {
      response.status(404).send({ errors: 'Comment not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(request, qetaEditCommentPermission, {
      resource: comment,
    });

    const [tagsFilter, commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const post = await database.updatePostComment(
      postId,
      commentId,
      username,
      request.body.content,
      {
        tagsFilter,
        commentsFilter,
        answersFilter,
      },
    );

    if (post === null) {
      response
        .status(400)
        .send({ errors: 'Failed to update post comment', type: 'body' });
      return;
    }

    auditor?.createEvent({
      eventId: 'update-comment',
      severityLevel: 'medium',
      request,
      meta: {
        post: entityToJsonObject(post),
        from: entityToJsonObject(comment),
        to: request.body.content,
      },
    });

    await mapAdditionalFields(request, post, options);

    // Response
    response.json(post);
  });

  // DELETE /posts/:id/comments/:commentId
  router.delete(`/posts/:id/comments/:commentId`, async (request, response) => {
    // Validation
    // Act
    const postId = Number.parseInt(request.params.id, 10);
    const commentId = Number.parseInt(request.params.commentId, 10);
    if (Number.isNaN(postId) || Number.isNaN(commentId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const comment = await database.getComment(commentId, { postId });

    if (!comment) {
      response.status(404).send({ errors: 'Comment not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(request, qetaDeleteCommentPermission, {
      resource: comment,
    });

    const [tagsFilter, commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const post = await database.deletePostComment(postId, commentId, username, {
      tagsFilter,
      commentsFilter,
      answersFilter,
    });

    if (post === null) {
      response
        .status(400)
        .send({ errors: 'Failed to delete post comment', type: 'body' });
      return;
    }

    auditor?.createEvent({
      eventId: 'delete-comment',
      severityLevel: 'medium',
      request,
      meta: {
        post: entityToJsonObject(post),
        comment: entityToJsonObject(comment),
      },
    });

    await mapAdditionalFields(request, post, options);

    // Response
    response.json(post);
  });

  // POST /posts
  router.post(`/posts`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    await permissionMgr.authorize(request, qetaCreatePostPermission);

    const existingTags = await database.getTags();
    const [tags, entities, username, created] = await Promise.all([
      getTags(request, options, existingTags),
      getEntities(request, config),
      permissionMgr.getUsername(request),
      getCreated(request, options),
    ]);

    // Act
    const post = await database.createPost({
      user_ref: username,
      title: request.body.title,
      content: request.body.content,
      created,
      tags,
      entities,
      images: request.body.images,
      anonymous: request.body.anonymous || username === 'user:default/guest',
      type: request.body.type,
      headerImage: request.body.headerImage,
      opts: {
        includeComments: false,
        includeVotes: false,
        includeAnswers: false,
      },
    });

    if (!post) {
      response.status(400).send({ errors: 'Failed to post', type: 'body' });
      return;
    }

    wrapAsync(async () => {
      const followingUsers = await Promise.all([
        database.getUsersForTags(tags),
        database.getUsersForEntities(entities),
        database.getFollowingUsers(username),
        database.getUsersWhoFavoritedPost(post.id),
      ]);
      const sent = await notificationMgr.onNewPost(
        username,
        post,
        followingUsers.flat(),
      );
      const mentions = findUserMentions(request.body.content);
      if (mentions.length > 0) {
        await notificationMgr.onMention(username, post, sent, mentions);
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        question: post,
        author: username,
      },
      metadata: { action: 'new_post' },
    });
    auditor?.createEvent({
      eventId: 'create-post',
      severityLevel: 'medium',
      request,
      meta: {
        post: entityToJsonObject(post),
      },
    });

    await mapAdditionalFields(request, post, options);

    // Response
    response.status(201).json(post);
  });

  // POST /posts/:id
  router.post(`/posts/:id`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const originalPost = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    if (!originalPost) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(request, qetaEditPostPermission, {
      resource: originalPost,
    });

    const existingTags = await database.getTags();
    const [tags, entities, tagsFilter, commentsFilter, answersFilter] =
      await Promise.all([
        getTags(request, options, existingTags),
        getEntities(request, config),
        permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission),
        permissionMgr.getAuthorizeConditions(
          request,
          qetaReadCommentPermission,
        ),
        permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission),
      ]);

    // Act
    const post = await database.updatePost({
      id: postId,
      user_ref: username,
      title: request.body.title,
      content: request.body.content,
      tags,
      entities,
      images: request.body.images,
      headerImage: request.body.headerImage,
      opts: { tagsFilter, commentsFilter, answersFilter },
    });

    if (!post) {
      response.sendStatus(401);
      return;
    }

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        post,
        author: username,
      },
      metadata: { action: 'update_post' },
    });

    await mapAdditionalFields(request, post, options);

    auditor?.createEvent({
      eventId: 'update-post',
      severityLevel: 'medium',
      request,
      meta: {
        from: entityToJsonObject(originalPost),
        to: entityToJsonObject(post),
      },
    });

    // Response
    response.json(post);
  });

  // DELETE /questions/:id
  router.delete('/posts/:id', async (request, response) => {
    // Validation
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }
    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(request, qetaDeletePostPermission, {
      resource: post,
    });

    // Act
    const deleted = await database.deletePost(postId);

    if (deleted) {
      events?.publish({
        topic: 'qeta',
        eventPayload: {
          post,
          author: username,
        },
        metadata: { action: 'delete_post' },
      });

      auditor?.createEvent({
        eventId: 'delete-post',
        severityLevel: 'medium',
        request,
        meta: { post: entityToJsonObject(post) },
      });
    }

    // Response
    response.sendStatus(deleted ? 204 : 404);
  });

  const votePost = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    // Act
    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(username, postId, false);

    if (post === null) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });
    if (post.own) {
      response
        .status(400)
        .send({ errors: 'You cannot vote your own post', type: 'body' });
      return;
    }

    const voted = await database.votePost(username, postId, score);

    if (!voted) {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    const resp = await database.getPost(username, postId, false, {
      includeComments: false,
      includeAnswers: false,
      includeAttachments: false,
      includeTags: false,
      includeEntities: false,
    });
    if (resp === null) {
      response.sendStatus(404);
      return;
    }

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        resp,
        author: username,
        score,
      },
      metadata: { action: 'vote_post' },
    });

    await mapAdditionalFields(request, resp, options);
    resp.ownVote = score;

    auditor?.createEvent({
      eventId: 'vote',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post), score },
    });

    signalPostStats(signals, resp);

    // Response
    response.json(resp);
  };

  // GET /posts/:id/upvote
  router.get(`/posts/:id/upvote`, async (request, response) => {
    return await votePost(request, response, 1);
  });

  // GET /posts/:id/downvote
  router.get(`/posts/:id/downvote`, async (request, response) => {
    return await votePost(request, response, -1);
  });

  router.delete('/posts/:id/vote', async (request, response) => {
    // Validation
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    // Act
    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(username, postId, false);

    if (post === null) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });

    const deleted = await database.deletePostVote(username, postId);
    if (!deleted) {
      response.sendStatus(404);
      return;
    }

    const resp = await database.getPost(username, postId, false, {
      includeComments: false,
      includeAnswers: false,
      includeAttachments: false,
      includeTags: false,
      includeEntities: false,
    });
    if (resp === null) {
      response.sendStatus(404);
      return;
    }

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        post,
        author: username,
      },
      metadata: { action: 'delete_vote' },
    });

    await mapAdditionalFields(request, resp, options);
    resp.ownVote = undefined;

    auditor?.createEvent({
      eventId: 'delete-vote',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });
    response.json(resp);
  });

  // GET /posts/:id/favorite
  router.get(`/posts/:id/favorite`, async (request, response) => {
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });

    const favorited = await database.favoritePost(username, postId);

    if (!favorited) {
      response.sendStatus(404);
      return;
    }

    post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
      {
        includeComments: false,
        includeAnswers: false,
        includeEntities: false,
        includeVotes: false,
        includeTags: false,
        includeAttachments: false,
      },
    );

    if (!post) {
      response.sendStatus(404);
      return;
    }

    auditor?.createEvent({
      eventId: 'favorite-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });

    await mapAdditionalFields(request, post, options);

    // Response
    response.json(post);
  });

  // GET /posts/:id/unfavorite
  router.get(`/posts/:id/unfavorite`, async (request, response) => {
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await permissionMgr.authorize(request, qetaReadPostPermission, {
      resource: post,
    });

    const unfavorited = await database.unfavoritePost(username, postId);

    if (!unfavorited) {
      response.sendStatus(404);
      return;
    }

    post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
      {
        includeComments: false,
        includeAnswers: false,
        includeEntities: false,
        includeVotes: false,
        includeTags: false,
        includeAttachments: false,
      },
    );

    if (!post) {
      response.sendStatus(404);
      return;
    }

    auditor?.createEvent({
      eventId: 'unfavorite-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });

    await mapAdditionalFields(request, post, options);

    // Response
    response.json(post);
  });
};
