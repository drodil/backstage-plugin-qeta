import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  authorize,
  authorizeConditional,
  getCreated,
  getUsername,
  mapAdditionalFields,
  QetaFilters,
  transformConditions,
} from '../util';
import {
  AnswersQuerySchema,
  CommentSchema,
  PostAnswerSchema,
  RouteOptions,
} from '../types';
import { Request, Router } from 'express';
import {
  findUserMentions,
  qetaCreateAnswerPermission,
  qetaCreateCommentPermission,
  qetaDeleteAnswerPermission,
  qetaDeleteCommentPermission,
  qetaEditAnswerPermission,
  qetaEditPostPermission,
  qetaReadAnswerPermission,
  qetaReadPostPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Response } from 'express-serve-static-core';
import { signalAnswerStats, signalPostStats, validateDateRange } from './util';
import {
  AuthorizeResult,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const answersRoutes = (router: Router, options: RouteOptions) => {
  const { database, events, signals, notificationMgr } = options;

  router.get(`/answers`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options, true);
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

    const decision = await authorizeConditional(
      request,
      qetaReadAnswerPermission,
      options,
    );

    if (decision.result === AuthorizeResult.CONDITIONAL) {
      const filter: PermissionCriteria<QetaFilters> = transformConditions(
        decision.conditions,
      );
      await database.getAnswers(username, request.query, filter);
    } else {
      response.json(await database.getAnswers(username, request.query));
    }
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
    const username = await getUsername(request, options);
    const post = await database.getPost(username, postId, false);
    if (!post || post.type !== 'question') {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }

    await authorize(request, qetaReadPostPermission, options, post);
    await authorize(request, qetaCreateAnswerPermission, options);

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

    const followingUsers = await Promise.all([
      database.getUsersForTags(post.tags),
      database.getUsersForEntities(post.entities),
    ]);
    notificationMgr.onNewAnswer(username, post, answer, followingUsers.flat());
    const mentions = findUserMentions(answer.content);
    if (mentions.length > 0) {
      notificationMgr.onMention(username, answer, mentions);
    }
    await mapAdditionalFields(request, answer, options);

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          answer,
          question: post,
          author: username,
        },
        metadata: { action: 'post_answer' },
      });
      signalPostStats(signals, post);
    }

    // Response
    response.status(201);
    response.json(answer);
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

    const username = await getUsername(request, options);

    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const post = await database.getPost(username, postId, false);
    let answer = await database.getAnswer(answerId, username);
    if (!answer || !post || post.type !== 'question') {
      response.status(404).send({ errors: 'Post not found', type: 'body' });
      return;
    }
    await authorize(request, qetaReadPostPermission, options, post);
    await authorize(request, qetaEditAnswerPermission, options, answer);

    // Act
    answer = await database.updateAnswer(
      username,
      postId,
      answerId,
      request.body.answer,
      request.body.images,
    );

    if (!answer) {
      response.sendStatus(404);
      return;
    }

    await mapAdditionalFields(request, answer, options);

    // Response
    response.status(201);
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

      const username = await getUsername(request, options);
      const post = await database.getPost(username, postId, false);

      if (!post) {
        response.status(404).send({ errors: 'Post not found', type: 'body' });
        return;
      }
      let answer = await database.getAnswer(answerId, username);

      await authorize(request, qetaReadPostPermission, options, post);
      await authorize(request, qetaReadAnswerPermission, options, answer);
      await authorize(request, qetaCreateCommentPermission, options);

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

      const followingUsers = await database.getUsersForTags(post.tags);
      notificationMgr.onAnswerComment(
        username,
        post,
        answer,
        request.body.content,
        followingUsers,
      );
      await mapAdditionalFields(request, answer, options);

      if (events) {
        events.publish({
          topic: 'qeta',
          eventPayload: {
            question: post,
            answer,
            comment: request.body.content,
            author: username,
          },
          metadata: { action: 'comment_answer' },
        });
      }

      // Response
      response.status(201);
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

      const username = await getUsername(request, options);
      const post = await database.getPost(username, postId, false);
      let answer = await database.getAnswer(answerId, username);
      const comment = await database.getAnswerComment(commentId);

      await authorize(request, qetaReadPostPermission, options, post);
      await authorize(request, qetaReadAnswerPermission, options, answer);
      await authorize(request, qetaDeleteCommentPermission, options, comment);

      // Act
      answer = await database.deleteAnswerComment(
        answerId,
        commentId,
        username,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      await mapAdditionalFields(request, answer, options);

      // Response
      response.status(201);
      response.json(answer);
    },
  );

  // GET /posts/:id/answers/:answerId
  router.get(`/posts/:id/answers/:answerId`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }
    const post = await database.getPost(username, postId, false);
    let answer = await database.getAnswer(answerId, username);

    await authorize(request, qetaReadPostPermission, options, post);
    await authorize(request, qetaEditAnswerPermission, options, answer);

    answer = await database.getAnswer(answerId, username);

    if (answer === null) {
      response.sendStatus(404);
      return;
    }

    await mapAdditionalFields(request, answer, options);

    // Response
    response.json(answer);
  });

  // DELETE /posts/:id/answers/:answerId
  router.delete('/posts/:id/answers/:answerId', async (request, response) => {
    // Validation
    const username = await getUsername(request, options);
    const postId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(postId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const post = await database.getPost(username, postId, false);
    const answer = await database.getAnswer(answerId, username);

    await authorize(request, qetaReadPostPermission, options, post);
    await authorize(request, qetaDeleteAnswerPermission, options, answer);

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          answer,
          author: username,
        },
        metadata: { action: 'delete_answer' },
      });
      signalPostStats(signals, post);
    }

    // Act
    const deleted = await database.deleteAnswer(answerId);

    // Response
    response.sendStatus(deleted ? 200 : 404);
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

    const username = await getUsername(request, options);
    const post = await database.getPost(username, postId, false);
    const answer = await database.getAnswer(answerId, username);

    if (answer === null || post === null) {
      response.sendStatus(404);
      return;
    }

    await authorize(request, qetaReadPostPermission, options, post);
    await authorize(request, qetaReadAnswerPermission, options, answer);

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

    await mapAdditionalFields(request, resp, options);
    resp.ownVote = score;

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          question: post,
          answer: resp,
          author: username,
          score,
        },
        metadata: { action: 'vote_answer' },
      });
    }

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

  // GET /posts/:id/answers/:answerId/correct
  router.get(
    `/posts/:id/answers/:answerId/correct`,
    async (request, response) => {
      const username = await getUsername(request, options);
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

      await authorize(request, qetaEditPostPermission, options, post);
      await authorize(request, qetaReadAnswerPermission, options, answer);

      const marked = await database.markAnswerCorrect(postId, answerId);

      if (!marked) {
        response
          .status(404)
          .send({ errors: 'Failed to mark answer correct', type: 'body' });
        return;
      }

      if (events || signals) {
        if (events) {
          events.publish({
            topic: 'qeta',
            eventPayload: {
              question: post,
              answer,
              author: username,
            },
            metadata: { action: 'correct_answer' },
          });
        }

        signalPostStats(signals, post);
        signalAnswerStats(signals, answer);
      }

      notificationMgr.onCorrectAnswer(username, post, answer);

      if (events || signals) {
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
      }

      response.sendStatus(200);
    },
  );

  // GET /posts/:id/answers/:answerId/incorrect
  router.get(
    `/posts/:id/answers/:answerId/incorrect`,
    async (request, response) => {
      const username = await getUsername(request, options);
      const postId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(postId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }
      const post = await database.getPost(username, postId, false);
      const answer = await database.getAnswer(answerId, username);

      await authorize(request, qetaEditPostPermission, options, post);
      await authorize(request, qetaReadAnswerPermission, options, answer);

      const marked = await database.markAnswerIncorrect(postId, answerId);
      if (events) {
        events.publish({
          topic: 'qeta',
          eventPayload: {
            question: post,
            answer,
            author: username,
          },
          metadata: { action: 'incorrect_answer' },
        });
      }
      response.sendStatus(marked ? 200 : 404);
    },
  );
};
