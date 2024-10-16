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
  qetaCreateAnswerPermission,
  qetaCreateCommentPermission,
  qetaDeleteAnswerPermission,
  qetaDeleteCommentPermission,
  qetaEditAnswerPermission,
  qetaEditQuestionPermission,
  qetaReadAnswerPermission,
  qetaReadQuestionPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Response } from 'express-serve-static-core';
import {
  signalAnswerStats,
  signalQuestionStats,
  validateDateRange,
} from './util';
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

  // POST /questions/:id/answers
  router.post(`/questions/:id/answers`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostAnswerSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const questionId = Number.parseInt(request.params.id, 10);
    if (Number.isNaN(questionId)) {
      response
        .status(400)
        .send({ errors: 'Invalid question id', type: 'body' });
      return;
    }
    const username = await getUsername(request, options);
    const question = await database.getQuestion(username, questionId, false);
    if (!question) {
      response.status(404).send({ errors: 'Question not found', type: 'body' });
      return;
    }

    await authorize(request, qetaReadQuestionPermission, options, question);
    await authorize(request, qetaCreateAnswerPermission, options);

    const created = await getCreated(request, options);

    // Act
    const answer = await database.answerQuestion(
      username,
      questionId,
      request.body.answer,
      created,
      request.body.images,
      request.body.anonymous || username === 'user:default/guest',
    );

    if (!answer) {
      response
        .status(400)
        .send({ errors: 'Failed to answer question', type: 'body' });
      return;
    }

    const followingUsers = await Promise.all([
      database.getUsersForTags(question.tags),
      database.getUsersForEntities(question.entities),
    ]);
    notificationMgr.onNewAnswer(
      username,
      question,
      answer,
      followingUsers.flat(),
    );
    await mapAdditionalFields(request, answer, options);

    if (events) {
      events.publish({
        topic: 'qeta',
        eventPayload: {
          answer,
          question,
          author: username,
        },
        metadata: { action: 'post_answer' },
      });
      signalQuestionStats(signals, question);
    }

    // Response
    response.status(201);
    response.json(answer);
  });

  // POST /questions/:id/answers/:answerId
  router.post(`/questions/:id/answers/:answerId`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostAnswerSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const username = await getUsername(request, options);

    const questionId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const question = await database.getQuestion(username, questionId, false);
    let answer = await database.getAnswer(answerId, username);
    await authorize(request, qetaReadQuestionPermission, options, question);
    await authorize(request, qetaEditAnswerPermission, options, answer);

    // Act
    answer = await database.updateAnswer(
      username,
      questionId,
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

  // POST /questions/:id/answers/:answerId/comments
  router.post(
    `/questions/:id/answers/:answerId/comments`,
    async (request, response) => {
      // Validation
      const validateRequestBody = ajv.compile(CommentSchema);
      if (!validateRequestBody(request.body)) {
        response
          .status(400)
          .send({ errors: validateRequestBody.errors, type: 'body' });
        return;
      }

      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await getUsername(request, options);
      const question = await database.getQuestion(username, questionId, false);

      if (!question) {
        response
          .status(404)
          .send({ errors: 'Question not found', type: 'body' });
        return;
      }
      let answer = await database.getAnswer(answerId, username);

      await authorize(request, qetaReadQuestionPermission, options, question);
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

      const followingUsers = await database.getUsersForTags(question.tags);
      notificationMgr.onAnswerComment(
        username,
        question,
        answer,
        request.body.content,
        followingUsers,
      );
      await mapAdditionalFields(request, answer, options);

      if (events) {
        events.publish({
          topic: 'qeta',
          eventPayload: {
            question,
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

  // DELETE /questions/:id/answers/:answerId/comments/:commentId
  router.delete(
    `/questions/:id/answers/:answerId/comments/:commentId`,
    async (request, response) => {
      // Validation
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      const commentId = Number.parseInt(request.params.commentId, 10);
      if (
        Number.isNaN(questionId) ||
        Number.isNaN(answerId) ||
        Number.isNaN(commentId)
      ) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const username = await getUsername(request, options);
      const question = await database.getQuestion(username, questionId, false);
      let answer = await database.getAnswer(answerId, username);
      const comment = await database.getAnswerComment(commentId);

      await authorize(request, qetaReadQuestionPermission, options, question);
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

  // GET /questions/:id/answers/:answerId
  router.get(`/questions/:id/answers/:answerId`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const questionId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }
    const question = await database.getQuestion(username, questionId, false);
    let answer = await database.getAnswer(answerId, username);

    await authorize(request, qetaReadQuestionPermission, options, question);
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

  // DELETE /questions/:id/answers/:answerId
  router.delete(
    '/questions/:id/answers/:answerId',
    async (request, response) => {
      // Validation
      const username = await getUsername(request, options);
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const question = await database.getQuestion(username, questionId, false);
      const answer = await database.getAnswer(answerId, username);

      await authorize(request, qetaReadQuestionPermission, options, question);
      await authorize(request, qetaDeleteAnswerPermission, options, answer);

      if (events) {
        events.publish({
          topic: 'qeta',
          eventPayload: {
            question,
            answer,
            author: username,
          },
          metadata: { action: 'delete_answer' },
        });
        signalQuestionStats(signals, question);
      }

      // Act
      const deleted = await database.deleteAnswer(answerId);

      // Response
      response.sendStatus(deleted ? 200 : 404);
    },
  );

  const voteAnswer = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation
    const questionId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const username = await getUsername(request, options);
    const question = await database.getQuestion(username, questionId, false);
    const answer = await database.getAnswer(answerId, username);

    if (answer === null || question === null) {
      response.sendStatus(404);
      return;
    }

    await authorize(request, qetaReadQuestionPermission, options, question);
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
          question,
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

  // GET /questions/:id/answers/:answerId/upvote
  router.get(
    `/questions/:id/answers/:answerId/upvote`,
    async (request, response) => {
      return await voteAnswer(request, response, 1);
    },
  );

  // GET /questions/:id/answers/:answerId/downvote
  router.get(
    `/questions/:id/answers/:answerId/downvote`,
    async (request, response) => {
      return await voteAnswer(request, response, -1);
    },
  );

  // GET /questions/:id/answers/:answerId/correct
  router.get(
    `/questions/:id/answers/:answerId/correct`,
    async (request, response) => {
      const username = await getUsername(request, options);
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const question = await database.getQuestion(username, questionId, false);
      const answer = await database.getAnswer(answerId, username);

      if (!question || !answer) {
        response
          .status(404)
          .send({ errors: 'Question or answer not found', type: 'body' });
        return;
      }

      await authorize(request, qetaEditQuestionPermission, options, question);
      await authorize(request, qetaReadAnswerPermission, options, answer);

      const marked = await database.markAnswerCorrect(questionId, answerId);

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
              question,
              answer,
              author: username,
            },
            metadata: { action: 'correct_answer' },
          });
        }

        signalQuestionStats(signals, question);
        signalAnswerStats(signals, answer);
      }

      notificationMgr.onCorrectAnswer(username, question, answer);

      if (events || signals) {
        const updated = await database.getAnswer(answerId, username);
        events?.publish({
          topic: 'qeta',
          eventPayload: {
            question,
            answer: updated,
            author: username,
          },
          metadata: { action: 'correct_answer' },
        });

        signalQuestionStats(signals, question);
        signalAnswerStats(signals, updated);
      }

      response.sendStatus(200);
    },
  );

  // GET /questions/:id/answers/:answerId/incorrect
  router.get(
    `/questions/:id/answers/:answerId/incorrect`,
    async (request, response) => {
      const username = await getUsername(request, options);
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }
      const question = await database.getQuestion(username, questionId, false);
      const answer = await database.getAnswer(answerId, username);

      await authorize(request, qetaEditQuestionPermission, options, question);
      await authorize(request, qetaReadAnswerPermission, options, answer);

      const marked = await database.markAnswerIncorrect(questionId, answerId);
      if (events) {
        events.publish({
          topic: 'qeta',
          eventPayload: {
            question,
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
