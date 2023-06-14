import { RouterOptions } from '../router';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { checkPermissions, getUsername, mapAdditionalFields } from '../util';
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
  const { database } = options;

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

    const username = await getUsername(request, options);
    // Act
    const answer = await database.answerQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      request.body.answer,
      request.body.images,
    );

    mapAdditionalFields(username, answer);

    // Response
    response.status(201);
    response.send(answer);
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
    // Act
    const answer = await database.updateAnswer(
      username,
      Number.parseInt(request.params.id, 10),
      Number.parseInt(request.params.answerId, 10),
      request.body.answer,
      request.body.images,
    );

    if (!answer) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, answer);

    // Response
    response.status(201);
    response.send(answer);
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

      const username = await getUsername(request, options);
      // Act
      const answer = await database.commentAnswer(
        Number.parseInt(request.params.answerId, 10),
        username,
        request.body.content,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, answer);

      // Response
      response.status(201);
      response.send(answer);
    },
  );

  // DELETE /questions/:id/answers/:answerId/comments/:commentId
  router.delete(
    `/questions/:id/answers/:answerId/comments/:commentId`,
    async (request, response) => {
      // Validation
      const username = await getUsername(request, options);
      // Act
      const answer = await database.deleteAnswerComment(
        Number.parseInt(request.params.answerId, 10),
        Number.parseInt(request.params.commentId, 10),
        username,
      );

      if (!answer) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, answer);

      // Response
      response.status(201);
      response.send(answer);
    },
  );

  // GET /questions/:id/answers/:answerId
  router.get(`/questions/:id/answers/:answerId`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const answer = await database.getAnswer(
      Number.parseInt(request.params.answerId, 10),
    );

    if (answer === null) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, answer);

    // Response
    response.send(answer);
  });

  // DELETE /questions/:id/answers/:answerId
  router.delete(
    '/questions/:id/answers/:answerId',
    async (request, response) => {
      // Validation

      // Act
      const deleted = await database.deleteAnswer(
        await getUsername(request, options),
        Number.parseInt(request.params.answerId, 10),
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

    // Act
    const username = await getUsername(request, options);
    const voted = await database.voteAnswer(
      username,
      Number.parseInt(request.params.answerId, 10),
      score,
    );

    if (!voted) {
      response.sendStatus(404);
      return;
    }

    const answer = await database.getAnswer(
      Number.parseInt(request.params.answerId, 10),
    );

    mapAdditionalFields(username, answer);
    if (answer) {
      answer.ownVote = score;
    }
    // Response
    response.send(answer);
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
      const marked = await database.markAnswerCorrect(
        await getUsername(request, options),
        Number.parseInt(request.params.id, 10),
        Number.parseInt(request.params.answerId, 10),
      );
      response.sendStatus(marked ? 200 : 404);
    },
  );

  // GET /questions/:id/answers/:answerId/correct
  router.get(
    `/questions/:id/answers/:answerId/incorrect`,
    async (request, response) => {
      const marked = await database.markAnswerIncorrect(
        await getUsername(request, options),
        Number.parseInt(request.params.id, 10),
        Number.parseInt(request.params.answerId, 10),
      );
      response.sendStatus(marked ? 200 : 404);
    },
  );
};
