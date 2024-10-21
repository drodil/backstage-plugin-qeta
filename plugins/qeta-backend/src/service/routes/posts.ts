import { PostOptions } from '../../database/QetaStore';
import {
  authorize,
  authorizeConditional,
  getCreated,
  getUsername,
  mapAdditionalFields,
  QetaFilters,
  transformConditions,
} from '../util';
import Ajv from 'ajv';
import { Request, Router } from 'express';
import {
  qetaCreateCommentPermission,
  qetaCreatePostPermission,
  qetaDeleteCommentPermission,
  qetaDeletePostPermission,
  qetaEditPostPermission,
  qetaReadPostPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CommentSchema,
  PostSchema,
  PostsQuerySchema,
  RouteOptions,
} from '../types';
import { Response } from 'express-serve-static-core';
import { signalPostStats, validateDateRange } from './util';
import {
  AuthorizeResult,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';
import { getEntities, getTags } from './routeUtil';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const postsRoutes = (router: Router, options: RouteOptions) => {
  const { database, events, config, signals, notificationMgr } = options;
  // GET /posts
  router.get(`/posts`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options, true);
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
      const posts = await database.getPosts(username, request.query, filter);
      response.json({ posts: posts.posts, total: posts.total });
    } else {
      const posts = await database.getPosts(username, request.query);
      response.json({ posts: posts.posts, total: posts.total });
    }
  });

  // GET /posts/list/:type
  router.get(`/posts/list/:type`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options, true);
    const validateQuery = ajv.compile(PostsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const optionOverride: PostOptions = {};
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
      const posts = await database.getPosts(
        username,
        { ...request.query, ...optionOverride },
        filter,
      );
      response.json({ posts: posts.posts, total: posts.total });
    } else {
      const posts = await database.getPosts(username, {
        ...request.query,
        ...optionOverride,
      });
      response.json({ posts: posts.posts, total: posts.total });
    }
  });

  // GET /posts/:id
  router.get(`/posts/:id`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (post === null) {
      response.sendStatus(404);
      return;
    }

    await authorize(request, qetaReadPostPermission, options, post);

    await mapAdditionalFields(request, post, options);
    await Promise.all(
      (post.answers ?? []).map(
        async a => await mapAdditionalFields(request, a, options),
      ),
    );

    signalPostStats(signals, post);

    // Response
    response.json(post);
  });

  // POST /posts/:id/comments
  router.post(`/posts/:id/comments`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
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

    let question = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await authorize(request, qetaReadPostPermission, options, question);
    await authorize(request, qetaCreateCommentPermission, options);

    question = await database.commentPost(
      questionId,
      username,
      request.body.content,
      created,
    );

    if (question === null) {
      response
        .status(400)
        .send({ errors: 'Failed to comment post', type: 'body' });
      return;
    }

    await mapAdditionalFields(request, question, options);
    await Promise.all(
      (question.answers ?? []).map(
        async a => await mapAdditionalFields(request, a, options),
      ),
    );

    const followingUsers = await Promise.all([
      database.getUsersForTags(question.tags),
      database.getUsersForEntities(question.entities),
    ]);
    notificationMgr.onNewPostComment(
      username,
      question,
      request.body.content,
      followingUsers.flat(),
    );

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          comment: request.body.content,
          author: username,
        },
        metadata: { action: 'comment_post' },
      });
    }

    // Response
    response.json(question);
  });

  // DELETE /posts/:id/comments/:commentId
  router.delete(`/posts/:id/comments/:commentId`, async (request, response) => {
    // Validation
    // Act
    const questionId = Number.parseInt(request.params.id, 10);
    const commentId = Number.parseInt(request.params.commentId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(commentId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    const comment = await database.getPostComment(commentId);

    await authorize(request, qetaDeleteCommentPermission, options, comment);

    const post = await database.deletePostComment(
      questionId,
      commentId,
      username,
    );

    if (post === null) {
      response
        .status(400)
        .send({ errors: 'Failed to delete post comment', type: 'body' });
      return;
    }

    await mapAdditionalFields(request, post, options);
    await Promise.all(
      (post.answers ?? []).map(
        async a => await mapAdditionalFields(request, a, options),
      ),
    );

    // Response
    response.json(post);
  });

  // POST /questions
  router.post(`/posts`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    await authorize(request, qetaCreatePostPermission, options);

    const tags = getTags(request, config);
    const entities = getEntities(request, config);
    const username = await getUsername(request, options);
    const created = await getCreated(request, options);

    // Act
    const question = await database.createPost({
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
    });

    if (!question) {
      response.status(400).send({ errors: 'Failed to post', type: 'body' });
      return;
    }

    const followingUsers = await Promise.all([
      database.getUsersForTags(tags),
      database.getUsersForEntities(entities),
    ]);
    notificationMgr.onNewPost(username, question, followingUsers.flat());

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          author: username,
        },
        metadata: { action: 'new_post' },
      });
    }

    // Response
    response.status(201);
    response.json(question);
  });

  // POST /questions/:id
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

    const username = await getUsername(request, options);
    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await authorize(request, qetaEditPostPermission, options, post);

    const tags = getTags(request, config);
    const entities = getEntities(request, config);

    // Act
    post = await database.updatePost({
      id: postId,
      user_ref: username,
      title: request.body.title,
      content: request.body.content,
      tags,
      entities,
      images: request.body.images,
      headerImage: request.body.headerImage,
    });

    if (!post) {
      response.sendStatus(401);
      return;
    }

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          author: username,
        },
        metadata: { action: 'update_post' },
      });
    }

    // Response
    response.status(200);
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
    const username = await getUsername(request, options);
    const post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );
    await authorize(request, qetaDeletePostPermission, options, post);

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          author: username,
        },
        metadata: { action: 'delete_post' },
      });
    }

    // Act
    const deleted = await database.deletePost(postId);

    // Response
    response.sendStatus(deleted ? 200 : 404);
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
    const username = await getUsername(request, options);
    const post = await database.getPost(username, postId, false);

    if (post === null) {
      response.sendStatus(404);
      return;
    }

    await authorize(request, qetaReadPostPermission, options, post);

    const voted = await database.votePost(username, postId, score);

    if (!voted) {
      response.sendStatus(404);
      return;
    }

    const resp = await database.getPost(username, postId, false);
    if (resp === null) {
      response.sendStatus(404);
      return;
    }
    await mapAdditionalFields(request, resp, options);
    resp.ownVote = score;

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question: resp,
          author: username,
          score,
        },
        metadata: { action: 'vote_post' },
      });
    }

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

  // GET /posts/:id/favorite
  router.get(`/posts/:id/favorite`, async (request, response) => {
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await authorize(request, qetaReadPostPermission, options, post);

    const favorited = await database.favoritePost(username, postId);

    if (!favorited) {
      response.sendStatus(404);
      return;
    }

    post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

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

    const username = await getUsername(request, options);
    let post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await authorize(request, qetaReadPostPermission, options, post);

    const unfavorited = await database.unfavoritePost(username, postId);

    if (!unfavorited) {
      response.sendStatus(404);
      return;
    }

    post = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    await mapAdditionalFields(request, post, options);

    // Response
    response.json(post);
  });
};
