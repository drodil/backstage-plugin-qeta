import { errorHandler } from '@backstage/backend-common';
import express, { Request } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import {
  MaybeAnswer,
  MaybeQuestion,
  QetaStore,
  QuestionsOptions,
} from '../database/QetaStore';
import { AuthenticationError } from '@backstage/errors';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Response } from 'express-serve-static-core';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';

export interface RouterOptions {
  identity: IdentityApi;
  database: QetaStore;
  logger: Logger;
  config: Config;
}

const ajv = new Ajv({ coerceTypes: 'array' });
addFormats(ajv);

interface QuestionsQuery {
  limit?: number;
  offset?: number;
  tags?: string[];
  entity?: string;
  author?: string;
  orderBy?: 'views' | 'score' | 'answersCount' | 'created' | 'updated';
  order?: 'desc' | 'asc';
  noCorrectAnswer?: boolean;
  noAnswers?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
}

const QuestionsQuerySchema: JSONSchemaType<QuestionsQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    author: { type: 'string', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['views', 'score', 'answersCount', 'created', 'updated'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    noCorrectAnswer: { type: 'boolean', nullable: true },
    noAnswers: { type: 'boolean', nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    includeAnswers: { type: 'boolean', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
  },
  required: [],
  additionalProperties: false,
};

interface PostQuestion {
  title: string;
  content: string;
  tags: string[];
  entities: string[];
}

const PostQuestionSchema: JSONSchemaType<PostQuestion> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
    tags: { type: 'array', items: { type: 'string' } },
    entities: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'content'],
  additionalProperties: false,
};

interface AnswerQuestion {
  answer: string;
}

const PostAnswerSchema: JSONSchemaType<AnswerQuestion> = {
  type: 'object',
  properties: {
    answer: { type: 'string', minLength: 1 },
  },
  required: ['answer'],
  additionalProperties: false,
};

export async function createRouter({
  logger,
  database,
  identity,
  config,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const getUsername = async (req: Request<unknown>): Promise<string> => {
    const user = await identity.getIdentity({ request: req });
    const allowAnonymous = config.getOptionalBoolean('qeta.allowAnonymous');
    if (!user) {
      if (allowAnonymous) {
        return 'user:default/guest';
      }
      throw new AuthenticationError(`Missing token in 'authorization' header`);
    }
    return user.identity.userEntityRef;
  };

  const mapAdditionalFields = (
    username: string,
    resp: MaybeQuestion | MaybeAnswer,
  ) => {
    if (!resp) {
      return;
    }
    resp.ownVote = resp.votes?.find(v => v.author === username)?.score;
    resp.own = resp.author === username;
  };

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // GET /questions
  router.get(`/questions`, async (request, response) => {
    // Validation
    const validateQuery = ajv.compile(QuestionsQuerySchema);
    if (!validateQuery(request.query)) {
      response
        .status(400)
        .send({ errors: validateQuery.errors, type: 'query' });
      return;
    }

    // Act
    const questions = await database.getQuestions(request.query);

    // Response
    response.send(questions);
  });

  // GET /questions
  router.get(`/questions/list/:type`, async (request, response) => {
    // Validation
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
    }

    // Act
    const questions = await database.getQuestions({
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
    const username = await getUsername(request);
    const question = await database.getQuestion(
      username,
      Number.parseInt(request.params.id, 10),
    );

    if (question === null) {
      response.sendStatus(404);
      return;
    }

    mapAdditionalFields(username, question);
    question.answers?.map(a => mapAdditionalFields(username, a));

    // Response
    response.send(question);
  });

  // POST /questions
  router.post(`/questions`, async (request, response) => {
    // Validation
    const validateRequestBody = ajv.compile(PostQuestionSchema);
    if (!validateRequestBody(request.body)) {
      response
        .status(400)
        .send({ errors: validateRequestBody.errors, type: 'body' });
      return;
    }

    // Act
    const question = await database.postQuestion(
      await getUsername(request),
      request.body.title,
      request.body.content,
      request.body.tags,
      request.body.entities,
    );

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

    // Act
    const question = await database.updateQuestion(
      Number.parseInt(request.params.id, 10),
      await getUsername(request),
      request.body.title,
      request.body.content,
      request.body.tags,
      request.body.entities,
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

    // Act
    const deleted = await database.deleteQuestion(
      await getUsername(request),
      Number.parseInt(request.params.id, 10),
    );

    // Response
    response.sendStatus(deleted ? 200 : 404);
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

    const username = await getUsername(request);
    // Act
    const answer = await database.answerQuestion(
      username,
      Number.parseInt(request.params.id, 10),
      request.body.answer,
    );

    mapAdditionalFields(username, answer);

    // Response
    response.status(201);
    response.send(answer);
  });

  // DELETE /questions/:id/answers/:answerId
  router.delete(
    '/questions/:id/answers/:answerId',
    async (request, response) => {
      // Validation

      // Act
      const deleted = await database.deleteAnswer(
        await getUsername(request),
        Number.parseInt(request.params.answerId, 10),
      );

      // Response
      response.sendStatus(deleted ? 200 : 404);
    },
  );

  const voteQuestion = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation

    // Act
    const username = await getUsername(request);
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

    mapAdditionalFields(username, question);
    if (question) {
      question.ownVote = score;
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

  const voteAnswer = async (
    request: Request<any>,
    response: Response,
    score: number,
  ) => {
    // Validation

    // Act
    const username = await getUsername(request);
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
        await getUsername(request),
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
        await getUsername(request),
        Number.parseInt(request.params.id, 10),
        Number.parseInt(request.params.answerId, 10),
      );
      response.sendStatus(marked ? 200 : 404);
    },
  );

  // GET /tags
  router.get('/tags', async (_request, response) => {
    const tags = await database.getTags();
    response.send(tags);
  });

  router.use(errorHandler());
  return router;
}
