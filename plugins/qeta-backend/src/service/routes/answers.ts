import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { getCreated, mapAdditionalFields } from '../util';
import {
  AnswersQuerySchema,
  CommentSchema,
  DeleteMetadataSchema,
  PostAnswerSchema,
  RouteOptions,
} from '../types';
import { Request, Router } from 'express';
import {
  AnswersQuery,
  findEntityMentions,
  qetaCreateAnswerPermission,
  qetaCreateCommentPermission,
  qetaDeleteAnswerPermission,
  qetaDeleteCommentPermission,
  qetaEditAnswerPermission,
  qetaEditCommentPermission,
  qetaEditPostPermission,
  qetaReadAnswerPermission,
  qetaReadCommentPermission,
  qetaReadPostPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Response } from 'express-serve-static-core';
import {
  entityToJsonObject,
  signalAnswerStats,
  signalPostStats,
  validateDateRange,
  wrapAsync,
} from './util';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const answersRoutes = (router: Router, options: RouteOptions) => {
  const { database, events, signals, notificationMgr, auditor, permissionMgr } =
    options;

  router.get(`/answers`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(AnswersQuerySchema);
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

    const [commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const opts = request.query as AnswersQuery;

    const answers = await database.getAnswers(username, opts, answersFilter, {
      commentsFilter,
    });

    await mapAdditionalFields(request, answers.answers, options, {
      checkRights: opts.checkAccess ?? false,
    });
    response.json(answers);
  });

  router.post(`/answers/query`, async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request, true);
    const validateQuery = ajv.compile(AnswersQuerySchema);
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

    const [commentsFilter, answersFilter] = await Promise.all([
      permissionMgr.getAuthorizeConditions(request, qetaReadCommentPermission, {
        allowServicePrincipal: true,
      }),
      permissionMgr.getAuthorizeConditions(request, qetaReadAnswerPermission, {
        allowServicePrincipal: true,
      }),
    ]);

    const opts = request.body;

    const answers = await database.getAnswers(username, opts, answersFilter, {
      commentsFilter,
    });
    await mapAdditionalFields(request, answers.answers, options, {
      checkRights: opts.checkAccess ?? false,
      username,
    });
    response.json(answers);
  });

  // POST /posts/:id/answers
  router.post(`/posts/:id/answers`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostAnswerSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const postId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(postId)) {
      response.status(400).send({ errors: 'Invalid post id', type: 'body' });
      return;
    }
    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(username, postId, false);
    if (!post || post.type !== 'question') {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    if (post.status === 'obsolete') {
      response
        .status(400)
        .send({ errors: 'Cannot add answers to obsolete posts', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaCreateAnswerPermission },
      ],
      { throwOnDeny: true },
    );

    const created = await getCreated(request, options);

    // Act
    const answer = await database.answerPost(
      username,
      postId,
      request.body.answer,
      created,
      request.body.images,
      request.body.anonymous || username === 'user:default/guest',
    );

    if (!answer) {
      response
        .status(400)
        .send({ errors: 'Failed to answer post', type: 'body' });
      return;
    }

    wrapAsync(async () => {
      const followingUsers = await Promise.all([
        database.getUsersForTags(post.tags),
        database.getUsersForEntities(post.entities),
        database.getFollowingUsers(username),
        database.getUsersWhoFavoritedPost(post.id),
      ]);
      const sent = await notificationMgr.onNewAnswer(
        username,
        post,
        answer,
        followingUsers.flat(),
      );
      const mentions = findEntityMentions(answer.content);
      if (mentions.length > 0) {
        await notificationMgr.onMention(username, answer, mentions, sent);
      }
    });

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        answer,
        question: post,
        author: username,
      },
      metadata: { action: 'post_answer' },
    });

    await mapAdditionalFields(request, [answer], options, { username });

    signalPostStats(signals, post);
    auditor?.createEvent({
      eventId: 'create-answer',
      severityLevel: 'medium',
      request,
      meta: {
        answer: entityToJsonObject(answer),
        post: entityToJsonObject(post),
      },
    });

    // Response
    response.status(201).json(answer);
  });

  // POST /questions/:id/answers/:answerId
  router.post(`/posts/:id/answers/:answerId`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostAnswerSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);

    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const post = await database.getPost(username, postId, false);
    const originalAnswer = await database.getAnswer(answerId, username);
    if (!originalAnswer || !post || post.type !== 'question') {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    if (post.status === 'obsolete') {
      response.status(400).send({
        errors: 'Cannot edit answers on obsolete posts',
        type: 'body',
      });
      return;
    }
    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaEditAnswerPermission, resource: originalAnswer },
      ],
      { throwOnDeny: true },
    );

    if (
      request.body.author &&
      request.body.author !== username &&
      request.body.author !== originalAnswer.author
    ) {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(400)
          .json({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }
    }

    // Act
    const answer = await database.updateAnswer(
      username,
      postId,
      answerId,
      request.body.answer,
      request.body.author,
      request.body.images,
    );

    if (!answer) {
      response.sendStatus(404);
      return;
    }

    auditor?.createEvent({
      eventId: 'update-answer',
      severityLevel: 'medium',
      request,
      meta: {
        from: entityToJsonObject(originalAnswer),
        to: entityToJsonObject(answer),
        post: entityToJsonObject(post),
      },
    });

    await mapAdditionalFields(request, [answer], options, { username });

    // Response
    response.json(answer);
  });

  // POST /posts/:id/answers/:answerId/comments
  router.post(
    `/posts/:id/answers/:answerId/comments`,
    async (request, response) => {
      // Validation
      const validateRequestBody = ajv.compile(CommentSchema);
      if (!validateRequestBody(request.body)) {
        response
          .status(400)
          .send({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }

      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(postId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await permissionMgr.getUsername(request);
      const post = await database.getPost(username, postId, false);

      if (!post) {
        response.status(404).send({ errors: 'Post not found', type: 'body' });
        return;
      }

      if (post.status === 'obsolete') {
        response.status(400).send({
          errors: 'Cannot add comments to obsolete posts',
          type: 'body',
        });
        return;
      }
      let answer = await database.getAnswer(answerId, username);
      if (!answer) {
        response.sendStatus(404);
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaReadPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
          { permission: qetaCreateCommentPermission },
        ],
        { throwOnDeny: true },
      );

      const created = await getCreated(request, options);
      // Act
      answer = await database.commentAnswer(
        answerId,
        username,
        request.body.content,
        created,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      wrapAsync(async () => {
        if (!answer) {
          return;
        }

        const followingUsers = await Promise.all([
          database.getUsersForTags(post.tags),
          database.getUsersForEntities(post.entities),
          database.getFollowingUsers(username),
          database.getUsersWhoFavoritedPost(post.id),
        ]);
        const sent = await notificationMgr.onAnswerComment(
          username,
          post,
          answer,
          request.body.content,
          followingUsers.flat(),
        );
        const mentions = findEntityMentions(request.body.content);
        if (mentions.length > 0) {
          await notificationMgr.onMention(
            username,
            answer,
            mentions,
            sent,
            true,
          );
        }
      });

      events?.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          answer,
          comment: request.body.content,
          author: username,
        },
        metadata: { action: 'comment_answer' },
      });

      await mapAdditionalFields(request, [answer], options, { username });

      auditor?.createEvent({
        eventId: 'comment-answer',
        severityLevel: 'medium',
        request,
        meta: {
          answer: entityToJsonObject(answer),
          post: entityToJsonObject(post),
          comment: request.body.content,
        },
      });

      // Response
      response.status(201).json(answer);
    },
  );

  // POST /posts/:id/answers/:answerId/comments/:commentId
  router.post(
    `/posts/:id/answers/:answerId/comments/:commentId`,
    async (request, response) => {
      // Validation
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      const commentId = Number.parseInt(request.params.commentId, 10);
      if (
        Number.isNaN(postId) ||
        Number.isNaN(answerId) ||
        Number.isNaN(commentId)
      ) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await permissionMgr.getUsername(request);
      const post = await database.getPost(username, postId, false);
      let answer = await database.getAnswer(answerId, username);
      const comment = await database.getComment(commentId, { answerId });

      if (!post || !answer || !comment) {
        response
          .status(404)
          .send({ errors: 'Post, answer or comment not found', type: 'body' });
        return;
      }

      if (post.status === 'obsolete') {
        response.status(400).send({
          errors: 'Cannot edit comments on obsolete posts',
          type: 'body',
        });
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaReadPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
          { permission: qetaEditCommentPermission, resource: comment },
        ],
        { throwOnDeny: true },
      );

      // Act
      answer = await database.updateAnswerComment(
        answerId,
        commentId,
        username,
        request.body.content,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      auditor?.createEvent({
        eventId: 'delete-comment',
        severityLevel: 'medium',
        request,
        meta: {
          post: entityToJsonObject(post),
          answer: entityToJsonObject(answer),
          from: entityToJsonObject(comment),
          to: request.body.content,
        },
      });

      await mapAdditionalFields(request, [answer], options, { username });

      // Response
      response.json(answer);
    },
  );

  // DELETE /posts/:id/answers/:answerId/comments/:commentId
  router.delete(
    `/posts/:id/answers/:answerId/comments/:commentId`,
    async (request, response) => {
      // Validation
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      const commentId = Number.parseInt(request.params.commentId, 10);
      if (
        Number.isNaN(postId) ||
        Number.isNaN(answerId) ||
        Number.isNaN(commentId)
      ) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await permissionMgr.getUsername(request);
      const post = await database.getPost(username, postId, false);
      let answer = await database.getAnswer(answerId, username);
      const comment = await database.getComment(commentId, { answerId });

      if (!post || !answer || !comment) {
        response
          .status(404)
          .send({ errors: 'Post, answer or comment not found', type: 'body' });
        return;
      }

      if (post.status === 'obsolete') {
        response.status(400).send({
          errors: 'Cannot delete comments on obsolete posts',
          type: 'body',
        });
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaReadPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
          { permission: qetaDeleteCommentPermission, resource: comment },
        ],
        { throwOnDeny: true },
      );

      // Act
      if (comment.status === 'deleted' || request.body?.permanent === true) {
        if (!permissionMgr.isModerator(request)) {
          response
            .status(404)
            .send({ errors: 'Comment not found', type: 'query' });
          return;
        }
        answer = await database.deleteAnswerComment(
          answerId,
          commentId,
          username,
          true,
        );
      } else {
        answer = await database.deleteAnswerComment(
          answerId,
          commentId,
          username,
        );
      }

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      auditor?.createEvent({
        eventId: 'delete-comment',
        severityLevel: 'medium',
        request,
        meta: {
          post: entityToJsonObject(post),
          answer: entityToJsonObject(answer),
          comment: entityToJsonObject(comment),
        },
      });

      await mapAdditionalFields(request, [answer], options);

      // Response
      response.json(answer);
    },
  );

  // GET /posts/:id/answers/:answerId
  router.get(`/posts/:id/answers/:answerId`, async (request, response) => {
    // Validation
    // Act
    const username = await permissionMgr.getUsername(request);
    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }
    const post = await database.getPost(username, postId, false);
    let answer = await database.getAnswer(answerId, username);

    if (!post || !answer) {
      response.sendStatus(404);
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaEditAnswerPermission, resource: answer },
      ],
      { throwOnDeny: true },
    );

    answer = await database.getAnswer(answerId, username);

    if (!post || !answer) {
      response.sendStatus(404);
      return;
    }

    await mapAdditionalFields(request, [answer], options, { username });

    auditor?.createEvent({
      eventId: 'read-answer',
      severityLevel: 'low',
      request,
      meta: {
        post: entityToJsonObject(post),
        answer: entityToJsonObject(answer),
      },
    });

    // Response
    response.json(answer);
  });

  // DELETE /posts/:id/answers/:answerId
  router.delete('/posts/:id/answers/:answerId', async (request, response) => {
    // Validation
    const username = await permissionMgr.getUsername(request);
    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    const validateRequestBody = ajv.compile(DeleteMetadataSchema);
    if (
      Number.isNaN(postId) ||
      Number.isNaN(answerId) ||
      !validateRequestBody(request.body)
    ) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const post = await database.getPost(username, postId, false);
    const answer = await database.getAnswer(answerId, username);

    if (!post || !answer) {
      response
        .status(404)
        .send({ errors: 'Post or answer not found', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaDeleteAnswerPermission, resource: answer },
      ],
      { throwOnDeny: true },
    );

    // Act
    let deleted = false;
    if (answer.status === 'deleted' || request.body?.permanent === true) {
      if (!(await permissionMgr.isModerator(request))) {
        response
          .status(404)
          .send({ errors: 'Answer not found', type: 'query' });
        return;
      }
      deleted = await database.deleteAnswer(answerId, true);
    } else {
      deleted = await database.deleteAnswer(answerId);
      if (deleted) {
        notificationMgr.onAnswerDelete(
          username,
          post,
          answer,
          request.body.reason,
        );
      }
    }

    if (deleted) {
      signalPostStats(signals, post);
      events?.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          answer,
          author: username,
          reason: request.body.reason,
        },
        metadata: { action: 'delete_answer' },
      });
      auditor?.createEvent({
        eventId: 'delete-answer',
        severityLevel: 'medium',
        request,
        meta: {
          answer: entityToJsonObject(answer),
          post: entityToJsonObject(post),
          reason: request.body.reason,
        },
      });
    }

    // Response
    response.sendStatus(deleted ? 204 : 404);
  });

  const voteAnswer = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation
    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const username = await permissionMgr.getUsername(request);
    const post = await database.getPost(username, postId, false);
    const answer = await database.getAnswer(answerId, username);

    if (answer === null || post === null) {
      response.sendStatus(404);
      return;
    }

    if (post.status === 'obsolete') {
      response
        .status(400)
        .send({ errors: 'Cannot vote on obsolete posts', type: 'body' });
      return;
    }

    await permissionMgr.authorize(
      request,
      [
        { permission: qetaReadPostPermission, resource: post },
        { permission: qetaReadAnswerPermission, resource: answer },
      ],
      { throwOnDeny: true },
    );

    if (answer.own) {
      response
        .status(400)
        .send({ errors: 'Cannot vote on own answer', type: 'body' });
      return;
    }

    // Act
    const voted = await database.voteAnswer(username, answerId, score);

    if (!voted) {
      response.sendStatus(404);
      return;
    }

    const resp = await database.getAnswer(answerId, username);
    if (resp === null) {
      response.sendStatus(404);
      return;
    }

    events?.publish({
      topic: 'qeta',
      eventPayload: {
        question: post,
        answer: resp,
        author: username,
        score,
      },
      metadata: { action: 'vote_answer' },
    });

    await mapAdditionalFields(request, [resp], options, { username });
    resp.ownVote = score;

    auditor?.createEvent({
      eventId: 'vote',
      severityLevel: 'low',
      request,
      meta: {
        post: entityToJsonObject(post),
        answer: entityToJsonObject(answer),
        score,
      },
    });

    signalAnswerStats(signals, resp);

    // Response
    response.json(resp);
  };

  // GET /posts/:id/answers/:answerId/upvote
  router.get(
    `/posts/:id/answers/:answerId/upvote`,
    async (request, response) => {
      return await voteAnswer(request, response, 1);
    },
  );

  // GET /posts/:id/answers/:answerId/downvote
  router.get(
    `/posts/:id/answers/:answerId/downvote`,
    async (request, response) => {
      return await voteAnswer(request, response, -1);
    },
  );

  router.delete(
    '/posts/:id/answers/:answerId/vote',
    async (request, response) => {
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(postId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await permissionMgr.getUsername(request);
      const post = await database.getPost(username, postId, false);
      const answer = await database.getAnswer(answerId, username);

      if (answer === null || post === null) {
        response.sendStatus(404);
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaReadPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
        ],
        { throwOnDeny: true },
      );

      const deleted = await database.deleteAnswerVote(username, answerId);
      if (!deleted) {
        response.sendStatus(404);
        return;
      }

      const resp = await database.getAnswer(answerId, username);
      if (resp === null) {
        response.sendStatus(404);
        return;
      }

      auditor?.createEvent({
        eventId: 'delete-vote',
        severityLevel: 'low',
        request,
        meta: {
          post: entityToJsonObject(post),
          answer: entityToJsonObject(answer),
        },
      });

      await mapAdditionalFields(request, [resp], options, { username });
      resp.ownVote = undefined;

      signalAnswerStats(signals, resp);

      // Response
      response.json(resp);
    },
  );

  // GET /posts/:id/answers/:answerId/correct
  router.get(
    `/posts/:id/answers/:answerId/correct`,
    async (request, response) => {
      const username = await permissionMgr.getUsername(request);
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(postId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const post = await database.getPost(username, postId, false);
      const answer = await database.getAnswer(answerId, username);
      const previousCorrectAnswers = await database.getAnswers(
        username,
        { questionId: postId, limit: 1 },
        undefined,
        {
          correct: true,
        },
      );

      if (!post || !answer) {
        response
          .status(404)
          .send({ errors: 'Post or answer not found', type: 'body' });
        return;
      }

      if (post.status === 'obsolete') {
        response.status(400).send({
          errors: 'Cannot mark answers on obsolete posts',
          type: 'body',
        });
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaEditPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
          ...previousCorrectAnswers.answers.map(a => ({
            permission: qetaReadAnswerPermission,
            resource: a,
          })),
        ],
        { throwOnDeny: true },
      );

      if (previousCorrectAnswers.answers.length > 0) {
        const previousCorrectAnswer = previousCorrectAnswers.answers[0];
        await database.markAnswerIncorrect(postId, previousCorrectAnswer.id);
        await signalAnswerStats(signals, {
          ...previousCorrectAnswer,
          correct: false,
        });
      }

      const marked = await database.markAnswerCorrect(postId, answerId);

      if (!marked) {
        response
          .status(404)
          .send({ errors: 'Failed to mark answer correct', type: 'body' });
        return;
      }

      wrapAsync(async () => {
        await notificationMgr.onCorrectAnswer(username, post, answer);
      });

      const updated = await database.getAnswer(answerId, username);
      events?.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          answer: updated,
          author: username,
        },
        metadata: { action: 'correct_answer' },
      });

      signalPostStats(signals, post);
      signalAnswerStats(signals, updated);

      auditor?.createEvent({
        eventId: 'correct-answer',
        severityLevel: 'medium',
        request,
        meta: {
          post: entityToJsonObject(post),
          answer: entityToJsonObject(answer),
        },
      });

      response.sendStatus(200);
    },
  );

  // GET /posts/:id/answers/:answerId/incorrect
  router.get(
    `/posts/:id/answers/:answerId/incorrect`,
    async (request, response) => {
      const username = await permissionMgr.getUsername(request);
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(postId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }
      const post = await database.getPost(username, postId, false);
      const answer = await database.getAnswer(answerId, username);

      if (!post || !answer) {
        response
          .status(404)
          .send({ errors: 'Post or answer not found', type: 'body' });
        return;
      }

      await permissionMgr.authorize(
        request,
        [
          { permission: qetaEditPostPermission, resource: post },
          { permission: qetaReadAnswerPermission, resource: answer },
        ],
        { throwOnDeny: true },
      );

      const marked = await database.markAnswerIncorrect(postId, answerId);

      if (marked) {
        events?.publish({
          topic: 'qeta',
          eventPayload: {
            question: post,
            answer,
            author: username,
          },
          metadata: { action: 'incorrect_answer' },
        });
        auditor?.createEvent({
          eventId: 'incorrect-answer',
          severityLevel: 'medium',
          request,
          meta: {
            post: entityToJsonObject(post),
            answer: entityToJsonObject(answer),
          },
        });
      }

      response.sendStatus(marked ? 200 : 404);
    },
  );
};
