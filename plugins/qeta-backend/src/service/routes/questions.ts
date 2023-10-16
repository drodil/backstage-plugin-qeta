import { RouterOptions } from '../router';
import { QuestionsOptions } from '../../database/QetaStore';
import {
  checkPermissions,
  getCreated,
  getUsername,
  isModerator,
  mapAdditionalFields,
} from '../util';
import Ajv from 'ajv';
import { Request, Router } from 'express';
import {
  qetaCreateQuestionPermission,
  qetaReadPermission,
} from '@drodil/backstage-plugin-qeta-common';
import addFormats from 'ajv-formats';
import {
  CommentSchema,
  PostQuestionSchema,
  QuestionsQuerySchema,
} from '../types';
import { Response } from 'express-serve-static-core';

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

export const questionsRoutes = (router: Router, options: RouterOptions) => {
  const { database, eventBroker, config } = options;
  // GET /questions
  router.get(`/questions`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const validateQuery = ajv.compile(QuestionsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    // Act
    const questions = await database.getQuestions(username, request.query);

    // Response
    response.send(questions);
  });

  // GET /questions
  router.get(`/questions/list/:type`, async (request, response) => {
    // Validation
    const username = await getUsername(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const validateQuery = ajv.compile(QuestionsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    const optionOverride: QuestionsOptions = {};
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
    }

    // Act
    const questions = await database.getQuestions(username, {
      ...request.query,
      ...optionOverride,
    });

    // Response
    response.send(questions);
  });

  // GET /questions/:id
  router.get(`/questions/:id`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const question = await database.getQuestion(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (question === null) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, question, options, moderator);
    question.answers?.map(a =>
      mapAdditionalFields(username, a, options, moderator),
    );

    // Response
    response.send(question);
  });

  // POST /questions/:id/comments
  router.post(`/questions/:id/comments`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const created = await getCreated(request, options);
    await checkPermissions(request, qetaReadPermission, options);
    const validateRequestBody = ajv.compile(CommentSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }
    const question = await database.commentQuestion(
      Number.parseInt(request.params.id, 10),
      username,
      request.body.content,
      created,
    );

    if (question === null) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, question, options, moderator);
    question.answers?.map(a =>
      mapAdditionalFields(username, a, options, moderator),
    );

    if (eventBroker) {
      await eventBroker.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          comment: request.body.content,
          author: username,
        },
        metadata: { action: 'comment_question' },
      });
    }

    // Response
    response.send(question);
  });

  // DELETE /questions/:id/comments/:commentId
  router.delete(
    `/questions/:id/comments/:commentId`,
    async (request, response) => {
      // Validation
      // Act
      const username = await getUsername(request, options);
      const moderator = await isModerator(request, options);
      await checkPermissions(request, qetaReadPermission, options);
      const question = await database.deleteQuestionComment(
        Number.parseInt(request.params.id, 10),
        Number.parseInt(request.params.commentId, 10),
        username,
        moderator,
      );

      if (question === null) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, question, options, moderator);
      question.answers?.map(a =>
        mapAdditionalFields(username, a, options, moderator),
      );

      // Response
      response.send(question);
    },
  );

  const getTags = (request: Request) => {
    const maxTags = config.getOptionalNumber('qeta.tags.max') ?? 5;
    const allowedTags =
      config.getOptionalStringArray('qeta.tags.allowedTags') ?? [];
    const allowTagCreation =
      config.getOptionalBoolean('qeta.tags.allowCreation') ?? true;

    let tags = request.body.tags;
    if (Array.isArray(tags)) {
      if (!allowTagCreation) {
        tags = tags.filter(tag => !allowedTags?.includes(tag));
      }
      tags = tags.slice(0, maxTags);
    }
    return tags;
  };

  const getEntities = (request: Request) => {
    const maxEntities = config.getOptionalNumber('qeta.entities.max') ?? 3;
    let entities = request.body.entities;
    if (Array.isArray(entities)) {
      entities = entities.slice(0, maxEntities);
    }
    return entities;
  };

  // POST /questions
  router.post(`/questions`, async (request, response) => {
    // Validation
    await checkPermissions(request, qetaCreateQuestionPermission, options);
    const validateRequestBody = ajv.compile(PostQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const tags = getTags(request);
    const entities = getEntities(request);
    const username = await getUsername(request, options);
    const created = await getCreated(request, options);

    // Act
    const question = await database.postQuestion(
      username,
      request.body.title,
      request.body.content,
      created,
      tags,
      entities,
      request.body.images,
      request.body.anonymous || username === 'user:default/guest',
    );

    if (eventBroker) {
      await eventBroker.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          author: username,
        },
        metadata: { action: 'post_question' },
      });
    }

    // Response
    response.status(201);
    response.send(question);
  });

  // POST /questions/:id
  router.post(`/questions/:id`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    const tags = getTags(request);
    const entities = getEntities(request);
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const globalEdit =
      options.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
    // Act
    const question = await database.updateQuestion(
      Number.parseInt(request.params.id, 10),
      username,
      request.body.title,
      request.body.content,
      tags,
      entities,
      request.body.images,
      moderator || globalEdit,
    );

    if (!question) {
      response.sendStatus(401);
      return;
    }

    // Response
    response.status(200);
    response.send(question);
  });

  // DELETE /questions/:id
  router.delete('/questions/:id', async (request, response) => {
    // Validation
    const moderator = await isModerator(request, options);

    // Act
    const deleted = await database.deleteQuestion(
      await getUsername(request, options),
      Number.parseInt(request.params.id, 10),
      moderator,
    );

    // Response
    response.sendStatus(deleted ? 200 : 404);
  });

  const voteQuestion = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation

    // Act
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const voted = await database.voteQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      score,
    );

    if (!voted) {
      response.sendStatus(404);
      return;
    }

    const question = await database.getQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    mapAdditionalFields(username, question, options, moderator);
    if (question) {
      question.ownVote = score;
    }

    if (eventBroker) {
      await eventBroker.publish({
        topic: 'qeta',
        eventPayload: {
          question,
          author: username,
          score,
        },
        metadata: { action: 'vote_question' },
      });
    }

    // Response
    response.send(question);
  };

  // GET /questions/:id/upvote
  router.get(`/questions/:id/upvote`, async (request, response) => {
    return await voteQuestion(request, response, 1);
  });

  // GET /questions/:id/downvote
  router.get(`/questions/:id/downvote`, async (request, response) => {
    return await voteQuestion(request, response, -1);
  });

  // GET /questions/:id/favorite
  router.get(`/questions/:id/favorite`, async (request, response) => {
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const favorited = await database.favoriteQuestion(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!favorited) {
      response.sendStatus(404);
      return;
    }

    const question = await database.getQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    mapAdditionalFields(username, question, options, moderator);

    // Response
    response.send(question);
  });

  // GET /questions/:id/unfavorite
  router.get(`/questions/:id/unfavorite`, async (request, response) => {
    const username = await getUsername(request, options);
    const moderator = await isModerator(request, options);
    const unfavorited = await database.unfavoriteQuestion(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (!unfavorited) {
      response.sendStatus(404);
      return;
    }

    const question = await database.getQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      false,
    );

    mapAdditionalFields(username, question, options, moderator);

    // Response
    response.send(question);
  });
};
