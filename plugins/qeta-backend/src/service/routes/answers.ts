import { RouterOptions } from '../router';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  checkPermissions,
  getCreated,
  getUsername,
  isModerator,
  mapAdditionalFields,
} from '../util';
import { CommentSchema, PostAnswerSchema } from '../types';
import { Request, Router } from 'express';
import {
  qetaCreateAnswerPermission,
  qetaReadPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Response } from 'express-serve-static-core';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const answersRoutes = (router: Router, options: RouterOptions) => {
  const { database, eventBroker } = options;

  // POST /questions/:id/answers
  router.post(`/questions/:id/answers`, async (request, response) => {
    // Validation
    await checkPermissions(request, qetaCreateAnswerPermission, options);
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
    const moderator = await isModerator(request, options);
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

    mapAdditionalFields(username, answer, options, moderator);

    if (eventBroker) {
      const question = await database.getQuestion(username, questionId, false);
      await eventBroker.publish({
        topic: 'qeta',
        eventPayload: {
          answer,
          question,
          author: username,
        },
        metadata: { action: 'post_answer' },
      });
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
    const moderator = await isModerator(request, options);
    const globalEdit =
      options.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;

    const questionId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    // Act
    const answer = await database.updateAnswer(
      username,
      questionId,
      answerId,
      request.body.answer,
      request.body.images,
      moderator || globalEdit,
    );

    if (!answer) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, answer, options, moderator);

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
      const moderator = await isModerator(request, options);
      const created = await getCreated(request, options);
      // Act
      const answer = await database.commentAnswer(
        answerId,
        username,
        request.body.content,
        created,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, answer, options, moderator);

      if (eventBroker) {
        const question = await database.getQuestion(
          username,
          questionId,
          false,
        );
        await eventBroker.publish({
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
      const username = await getUsername(request, options);
      const moderator = await isModerator(request, options);
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

      // Act
      const answer = await database.deleteAnswerComment(
        answerId,
        commentId,
        username,
        moderator,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, answer, options, moderator);

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
    const moderator = await isModerator(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const questionId = Number.parseInt(request.params.id, 10);
    const answerId = Number.parseInt(request.params.answerId, 10);
    if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
      response.status(400).send({ errors: 'Invalid id', type: 'body' });
      return;
    }

    const answer = await database.getAnswer(answerId, username);

    if (answer === null) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, answer, options, moderator);

    // Response
    response.json(answer);
  });

  // DELETE /questions/:id/answers/:answerId
  router.delete(
    '/questions/:id/answers/:answerId',
    async (request, response) => {
      // Validation
      const moderator = await isModerator(request, options);
      const username = await getUsername(request, options);
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      if (eventBroker) {
        const question = await database.getQuestion(
          username,
          questionId,
          false,
        );
        const answer = await database.getAnswer(answerId, username);
        await eventBroker.publish({
          topic: 'qeta',
          eventPayload: {
            question,
            answer,
            author: username,
          },
          metadata: { action: 'delete_answer' },
        });
      }

      // Act
      const deleted = await database.deleteAnswer(
        username,
        answerId,
        moderator,
      );

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

    // Act
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const voted = await database.voteAnswer(username, answerId, score);

    if (!voted) {
      response.sendStatus(404);
      return;
    }

    const answer = await database.getAnswer(answerId, username);

    mapAdditionalFields(username, answer, options, moderator);
    if (answer) {
      answer.ownVote = score;
    }

    if (eventBroker) {
      const question = await database.getQuestion(username, questionId, false);
      await eventBroker.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          answer,
          author: username,
          score,
        },
        metadata: { action: 'vote_answer' },
      });
    }
    // Response
    response.json(answer);
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
      const moderator = await isModerator(request, options);
      const globalEdit =
        options.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const marked = await database.markAnswerCorrect(
        username,
        questionId,
        answerId,
        moderator || globalEdit,
      );

      if (eventBroker) {
        const question = await database.getQuestion(
          username,
          questionId,
          false,
        );
        const answer = await database.getAnswer(answerId, username);
        await eventBroker.publish({
          topic: 'qeta',
          eventPayload: {
            question,
            answer,
            author: username,
          },
          metadata: { action: 'correct_answer' },
        });
      }
      response.sendStatus(marked ? 200 : 404);
    },
  );

  // GET /questions/:id/answers/:answerId/incorrect
  router.get(
    `/questions/:id/answers/:answerId/incorrect`,
    async (request, response) => {
      const username = await getUsername(request, options);
      const moderator = await isModerator(request, options);
      const globalEdit =
        options.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
      const questionId = Number.parseInt(request.params.id, 10);
      const answerId = Number.parseInt(request.params.answerId, 10);
      if (Number.isNaN(questionId) || Number.isNaN(answerId)) {
        response.status(400).send({ errors: 'Invalid id', type: 'body' });
        return;
      }

      const marked = await database.markAnswerIncorrect(
        username,
        questionId,
        answerId,
        moderator || globalEdit,
      );
      if (eventBroker) {
        const question = await database.getQuestion(
          username,
          questionId,
          false,
        );
        const answer = await database.getAnswer(answerId, username);
        await eventBroker.publish({
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
