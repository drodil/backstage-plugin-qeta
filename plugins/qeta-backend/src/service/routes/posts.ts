import { getCreated, mapAdditionalFields } from '../util';
import { durationToMilliseconds, HumanDuration } from '@backstage/types';
import Ajv from 'ajv';
import { Request, Router } from 'express';
import {
  findEntityMentions,
  PostsQuery,
  qetaCreateCommentPermission,
  qetaCreatePostPermission,
  qetaCreatePostReviewPermission,
  qetaDeleteCommentPermission,
  qetaDeletePostPermission,
  qetaEditCommentPermission,
  qetaEditPostPermission,
  qetaReadAnswerPermission,
  qetaReadCommentPermission,
  qetaReadPostPermission,
  qetaReadPostReviewPermission,
  qetaReadTagPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CommentSchema,
  DeleteMetadataSchema,
  PostQuerySchema,
  PostReviewBodySchema,
  PostSchema,
  PostsQuerySchema,
  RouteOptions,
  URLMetadataSchema,
} from '../types';
import { Response } from 'express-serve-static-core';
import {
  entityToJsonObject,
  extractMetadata,
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
    cache,
    signals,
    notificationMgr,
    auditor,
    permissionMgr,
  } = options;

  const postsOlderThan = config.getOptional<HumanDuration>(
    'qeta.contentHealth.postsOlderThan',
  ) ?? { months: 6 };
  const reviewThresholdMs = durationToMilliseconds(postsOlderThan);

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

  const getPostAndCheckStatus = async (
    request: Request,
    response: Response,
    recordView?: boolean,
    allowServiceToken?: boolean,
  ) => {
    const username = await permissionMgr.getUsername(
      request,
      allowServiceToken,
    );
    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return null;
    }

    const [tagsFilter, commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadTagPermission, {
        allowServicePrincipal: allowServiceToken,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: allowServiceToken,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: allowServiceToken,
      }),
    ]);

    const post = await database.getPost(username, postId, recordView, {
      tagsFilter,
      commentsFilter,
      answersFilter,
      includeHealth: true,
      reviewThresholdMs,
    });

    if (!post) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return null;
    }

    if (
      post.status === 'deleted' &&
      !(await permissionMgr.isModerator(request))
    ) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return null;
    }

    if (post.status === 'draft' && post.author !== username) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return null;
    }

    return {
      post,
      username,
      postId,
      tagsFilter,
      commentsFilter,
      answersFilter,
    };
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

    if (opts.reviewNeeded) {
      opts.obsolete = false;
      opts.includeHealth = true;
    }

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, opts);

    if (
      opts.status === 'deleted' &&
      !(await permissionMgr.isModerator(request))
    ) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return;
    }

    // Act
    const posts = await database.getPosts(username, opts, filter, {
      tagsFilter,
      commentsFilter,
      answersFilter,
      includeAnswers: false,
      includeComments: false,
      includeAttachments: false,
      includeExperts: false,
      includeHealth: opts.includeHealth,
      reviewThresholdMs,
      reviewNeeded: opts.reviewNeeded,
    });

    await mapAdditionalFields(request, posts.posts, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });
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

    if (
      opts.status === 'deleted' &&
      !(await permissionMgr.isModerator(request))
    ) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return;
    }

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, opts);

    if (opts.reviewNeeded) {
      opts.obsolete = false;
      opts.includeHealth = true;
    }

    // Act
    const posts = await database.getPosts(username, opts, filter, {
      tagsFilter,
      commentsFilter,
      answersFilter,
      includeAnswers: false,
      includeComments: false,
      includeAttachments: false,
      includeExperts: false,
      includeHealth: opts.includeHealth,
      reviewThresholdMs,
      reviewNeeded: opts.reviewNeeded,
    });
    await mapAdditionalFields(request, posts.posts, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });
    response.json(posts);
  });

  // POST /posts/suggest
  router.post(`/posts/suggest`, async (request, response) => {
    const username = await permissionMgr.getUsername(request, true);
    if (!request.body.title) {
      response.status(400).send({ errors: 'Title is required', type: 'body' });
      return;
    }

    const { title, content, tags, entities } = request.body;

    const [filter, tagsFilter, commentsFilter, answersFilter] =
      await getPostFilters(request, {
        includeAnswers: true,
        includeComments: false,
        includeAttachments: false,
        includeExperts: false,
      });

    console.log(`Request ${JSON.stringify(request.body)}`);

    const posts = await database.suggestPosts(
      username,
      title,
      content,
      tags,
      entities,
      filter,
      { tagsFilter, commentsFilter, answersFilter },
    );

    await mapAdditionalFields(request, posts.posts, options, {
      checkRights: false,
      username,
    });
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

    const optionOverride: PostsQuery = { status: 'active' };
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
      includeExperts: false,
      includeComments: false,
      commentsFilter,
      tagsFilter,
      answersFilter,
    });

    await mapAdditionalFields(request, posts.posts, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });
    response.json(posts);
  });

  // GET /posts/:id
  router.get(`/posts/:id`, async (request, response) => {
    const validateQuery = ajv.compile(PostQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }
    const anonymous = request.query.anonymous as undefined | boolean;

    const ret = await getPostAndCheckStatus(
      request,
      response,
      anonymous ? !anonymous : true,
      true,
    );
    if (!ret) return;
    const { post, username } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadPostPermission, resource: post }],
      { throwOnDeny: true },
    );

    await mapAdditionalFields(request, [post], options, { username });
    signalPostStats(signals, post);

    auditor?.createEvent({
      eventId: 'read-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });

    response.json(post);
  });

  // POST /posts/:id/comments
  router.post(`/posts/:id/comments`, async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;
    const { post, username, answersFilter, tagsFilter, commentsFilter } = ret;

    const created = await getCreated(request, options);
    const validateRequestBody = ajv.compile(CommentSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    if (post.status === 'obsolete') {
      response.status(400).send({
        errors: 'Cannot add comments to obsolete posts',
        type: 'body',
      });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaCreateCommentPermission },
      ],
      { throwOnDeny: true },
    );

    const updatedPost = await database.commentPost(
      post.id,
      username,
      request.body.content,
      created,
      { tagsFilter, commentsFilter, answersFilter },
    );

    if (updatedPost === null) {
      response
        .status(400)
        .send({ errors: 'Failed to comment post', type: 'body' });
      return;
    }

    await mapAdditionalFields(request, [updatedPost], options, { username });

    wrapAsync(async () => {
      if (!updatedPost || updatedPost.status !== 'active') {
        return;
      }
      const followingUsers = await Promise.all([
        database.getUsersForTags(updatedPost.tags),
        database.getUsersForEntities(updatedPost.entities),
        database.getFollowingUsers(username),
        database.getUsersWhoFavoritedPost(updatedPost.id),
      ]);

      const sent = await notificationMgr.onNewPostComment(
        username,
        updatedPost,
        request.body.content,
        followingUsers.flat(),
      );
      const mentions = findEntityMentions(request.body.content);
      if (mentions.length > 0) {
        await notificationMgr.onMention(
          username,
          updatedPost,
          mentions,
          sent,
          true,
        );
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        post: updatedPost,
        comment: request.body.content,
        author: username,
      },
      metadata: { action: 'comment_post' },
    });

    auditor?.createEvent({
      eventId: 'comment-post',
      severityLevel: 'medium',
      request,
      meta: {
        post: entityToJsonObject(updatedPost),
        comment: request.body.content,
      },
    });

    response.status(201).json(updatedPost);
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

    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;
    const { post, username, answersFilter, commentsFilter, tagsFilter } = ret;

    if (post.status === 'obsolete') {
      response.status(400).send({
        errors: 'Cannot edit comments on obsolete posts',
        type: 'body',
      });
      return;
    }

    const comment = await database.getComment(commentId, { postId });

    if (!comment) {
      response.status(404).send({ errors: 'Comment not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [{ permission: qetaEditCommentPermission, resource: comment }],
      { throwOnDeny: true },
    );

    const updatedPost = await database.updatePostComment(
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

    if (updatedPost === null) {
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
        post: entityToJsonObject(updatedPost),
        from: entityToJsonObject(comment),
        to: request.body.content,
      },
    });

    await mapAdditionalFields(request, [updatedPost], options, { username });

    // Response
    response.json(updatedPost);
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

    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;
    const { post, username, answersFilter, tagsFilter, commentsFilter } = ret;

    if (post.status === 'obsolete') {
      response.status(400).send({
        errors: 'Cannot delete comments on obsolete posts',
        type: 'body',
      });
      return;
    }

    const comment = await database.getComment(commentId, { postId });

    if (!comment) {
      response.status(404).send({ errors: 'Comment not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [{ permission: qetaDeleteCommentPermission, resource: comment }],
      { throwOnDeny: true },
    );

    let updatedPost = null;
    if (comment.status === 'deleted' || request.body?.permanent === true) {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(404)
          .send({ errors: 'Comment not found', type: 'query' });
        return;
      }
      updatedPost = await database.deletePostComment(
        postId,
        commentId,
        username,
        true,
        {
          tagsFilter,
          commentsFilter,
          answersFilter,
        },
      );
    } else {
      updatedPost = await database.deletePostComment(
        postId,
        commentId,
        username,
        false,
        {
          tagsFilter,
          commentsFilter,
          answersFilter,
        },
      );
    }

    if (updatedPost === null) {
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
        post: entityToJsonObject(updatedPost),
        comment: entityToJsonObject(comment),
      },
    });

    await mapAdditionalFields(request, [updatedPost], options, { username });

    // Response
    response.json(updatedPost);
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
    await permissionMgr.authorize(
      request,
      [{ permission: qetaCreatePostPermission }],
      { throwOnDeny: true },
    );

    const existingTags = await database.getTags();
    const [tags, entities, username, created] = await Promise.all([
      getTags(request, options, existingTags),
      getEntities(request, config),
      permissionMgr.getUsername(request),
      getCreated(request, options),
    ]);

    if (request.body.author && request.body.author !== username) {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(400)
          .json({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }
    }

    // Act
    const post = await database.createPost({
      user_ref: username,
      title: request.body.title,
      content: request.body.content,
      author: request.body.author,
      created,
      tags,
      entities,
      images: request.body.images,
      anonymous: request.body.anonymous || username === 'user:default/guest',
      type: request.body.type,
      headerImage: request.body.headerImage,
      url: request.body.url,
      status: request.body.status || 'active',
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
      if (!post || post.status !== 'active') {
        return;
      }
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
      const mentions = findEntityMentions(request.body.content);
      if (mentions.length > 0) {
        await notificationMgr.onMention(username, post, mentions, sent);
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        post,
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

    await mapAdditionalFields(request, [post], options, { username });

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

    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;
    const {
      post: originalPost,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaEditPostPermission, resource: originalPost }],
      { throwOnDeny: true },
    );

    if (request.body.status !== 'active' && originalPost.status === 'active') {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(400)
          .json({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }
    }

    if (
      request.body.author &&
      request.body.author !== username &&
      request.body.author !== originalPost.author
    ) {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(400)
          .json({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }
    }

    const existingTags = await database.getTags();
    const [tags, entities] = await Promise.all([
      getTags(request, options, existingTags),
      getEntities(request, config),
    ]);

    // Act
    const post = await database.updatePost({
      id: postId,
      user_ref: username,
      author: request.body.author,
      title: request.body.title,
      content: request.body.content,
      tags,
      entities,
      images: request.body.images,
      headerImage: request.body.headerImage,
      url: request.body.url,
      status: request.body.status || 'active',
      setUpdatedBy: originalPost.status !== 'draft',
      opts: { tagsFilter, commentsFilter, answersFilter },
    });

    if (!post) {
      response.sendStatus(401);
      return;
    }

    wrapAsync(async () => {
      if (!post || post.status !== 'active') {
        return;
      }
      const newTags = tags.filter(t => !originalPost.tags?.includes(t));
      const newEntities = entities.filter(
        e => !originalPost.entities?.includes(e),
      );

      const followingUsers = await Promise.all([
        database.getUsersForTags(newTags),
        database.getUsersForEntities(newEntities),
      ]);

      const sent = await notificationMgr.onPostEdit(
        username,
        post,
        followingUsers.flat(),
      );
      const originalMentions = findEntityMentions(originalPost.content);
      const mentions = findEntityMentions(request.body.content);
      const newMentions = mentions.filter(m => !originalMentions.includes(m));

      if (newMentions.length > 0) {
        await notificationMgr.onMention(username, post, newMentions, sent);
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        post,
        author: username,
      },
      metadata: { action: 'update_post' },
    });

    await mapAdditionalFields(request, [post], options, { username });

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

  // DELETE /posts/:id
  router.delete('/posts/:id', async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;
    const validateRequestBody = ajv.compile(DeleteMetadataSchema);
    if (!validateRequestBody(request.body)) {
      response.status(400).send({ errors: 'Invalid data', type: 'body' });
      return;
    }

    const { post, username } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaDeletePostPermission, resource: post }],
      { throwOnDeny: true },
    );

    let deleted = false;
    if (post.status === 'deleted' || request.body?.permanent === true) {
      if (!(await permissionMgr.isModerator(request))) {
        response.status(404).send({ errors: 'Post not found', type: 'query' });
        return;
      }
      deleted = await database.deletePost(post.id, true);
    } else {
      deleted = await database.deletePost(post.id);
      if (deleted) {
        notificationMgr.onPostDelete(username, post, request.body.reason);
      }
    }

    if (deleted) {
      events?.publish({
        topic: 'qeta',
        eventPayload: {
          post,
          author: post.author,
          reason: request.body.reason,
        },
        metadata: { action: 'delete_post' },
      });

      auditor?.createEvent({
        eventId: 'delete-post',
        severityLevel: 'medium',
        request,
        meta: { post: entityToJsonObject(post), reason: request.body.reason },
      });
    }

    response.sendStatus(deleted ? 204 : 404);
  });

  const votePost = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const {
      post,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadPostPermission, resource: post }],
      { throwOnDeny: true },
    );
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
      answersFilter,
      tagsFilter,
      commentsFilter,
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

    await mapAdditionalFields(request, [resp], options, { username });
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

  // POST /posts/:id/restore
  router.post('/posts/:id/restore', async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response, false, true);
    if (!ret) return;

    if (!(await permissionMgr.isModerator(request))) {
      response.status(404).send({ errors: 'Post not found', type: 'query' });
      return;
    }
    const {
      post: originalPost,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    // Act
    const post = await database.updatePost({
      id: postId,
      status: 'active',
      user_ref: username,
      setUpdatedBy: false,
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
      metadata: { action: 'restore_post' },
    });

    await mapAdditionalFields(request, [post], options, { username });

    auditor?.createEvent({
      eventId: 'restore-post',
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

  // PUT /posts/:id/click
  router.put('/posts/:id/click', async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const { postId, username } = ret;
    await database.clickPost(username, postId);
    response.status(200).send({});
  });

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
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const {
      post,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadPostPermission, resource: post }],
      { throwOnDeny: true },
    );

    const deleted = await database.deletePostVote(username, postId);
    if (!deleted) {
      response.sendStatus(404);
      return;
    }

    const resp = await database.getPost(username, postId, false, {
      answersFilter,
      tagsFilter,
      commentsFilter,
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

    await mapAdditionalFields(request, [resp], options, { username });
    resp.ownVote = undefined;

    auditor?.createEvent({
      eventId: 'delete-vote',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(post) },
    });
    response.json(resp);
  });

  // POST /posts/:id/review
  router.post('/posts/:id/review', async (request, response) => {
    const validateRequestBody = ajv.compile(PostReviewBodySchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .json({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const { post, postId } = ret;

    const user = await options.permissionMgr.getUsername(request, true);

    await options.permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaCreatePostReviewPermission },
      ],
      { throwOnDeny: true },
    );

    const updatedPost = await options.database.reviewPost(
      user,
      postId,
      request.body.status,
      request.body.comment,
    );
    if (!updatedPost) {
      response.sendStatus(404);
      return;
    }
    response.json(updatedPost);
  });

  // GET /posts/:id/reviews
  router.get('/posts/:id/reviews', async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const { post, postId } = ret;

    await options.permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaReadPostReviewPermission },
      ],
      { throwOnDeny: true },
    );

    const reviews = await options.database.getPostReviews(postId);
    response.json(reviews);
  });

  // GET /posts/:id/favorite
  router.get(`/posts/:id/favorite`, async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const {
      post,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadPostPermission, resource: post }],
      { throwOnDeny: true },
    );

    const favorited = await database.favoritePost(username, postId);

    if (!favorited) {
      response.sendStatus(404);
      return;
    }

    const updatedPost = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
      {
        answersFilter,
        tagsFilter,
        commentsFilter,
        includeComments: false,
        includeAnswers: false,
        includeEntities: false,
        includeVotes: false,
        includeTags: false,
        includeAttachments: false,
      },
    );

    if (!updatedPost) {
      response.sendStatus(404);
      return;
    }

    auditor?.createEvent({
      eventId: 'favorite-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(updatedPost) },
    });

    await mapAdditionalFields(request, [updatedPost], options, { username });

    // Response
    response.json(updatedPost);
  });

  // GET /posts/:id/unfavorite
  router.get(`/posts/:id/unfavorite`, async (request, response) => {
    const ret = await getPostAndCheckStatus(request, response);
    if (!ret) return;
    const {
      post,
      postId,
      username,
      answersFilter,
      tagsFilter,
      commentsFilter,
    } = ret;

    await permissionMgr.authorize(
      request,
      [{ permission: qetaReadPostPermission, resource: post }],
      { throwOnDeny: true },
    );

    const unfavorited = await database.unfavoritePost(username, postId);

    if (!unfavorited) {
      response.sendStatus(404);
      return;
    }

    const updatedPost = await database.getPost(
      username,
      Number.parseInt(request.params.id, 10),
      false,
      {
        answersFilter,
        tagsFilter,
        commentsFilter,
        includeComments: false,
        includeAnswers: false,
        includeEntities: false,
        includeVotes: false,
        includeTags: false,
        includeAttachments: false,
      },
    );

    if (!updatedPost) {
      response.sendStatus(404);
      return;
    }

    auditor?.createEvent({
      eventId: 'unfavorite-post',
      severityLevel: 'low',
      request,
      meta: { post: entityToJsonObject(updatedPost) },
    });

    await mapAdditionalFields(request, [updatedPost], options, { username });

    // Response
    response.json(updatedPost);
  });

  // POST /url
  router.post(`/url`, async (request, response) => {
    const validateQuery = ajv.compile(URLMetadataSchema);
    if (!validateQuery(request.body)) {
      response.status(400).send({ errors: validateQuery.errors, type: 'body' });
      return;
    }

    const url = new URL(request.body.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      response
        .status(400)
        .send({ errors: 'Invalid URL protocol', type: 'url' });
      return;
    }
    if (url.hostname === 'localhost') {
      response
        .status(400)
        .send({ errors: 'localhost not allowed', type: 'url' });
      return;
    }

    const cacheKey = `url:metadata:${url.toString()}`;
    const cached = await cache?.get(cacheKey);
    if (cached) {
      response.json(cached);
      return;
    }

    const metadata = await extractMetadata(url, options.logger);
    await cache?.set(cacheKey, metadata, { ttl: { weeks: 2 } });
    response.json(metadata);
  });
};
