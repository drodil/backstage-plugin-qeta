import * as fs from 'fs';
import express, { Request } from 'express';
import Router from 'express-promise-router';
import bodyParser from 'body-parser';
import addFormats from 'ajv-formats';
import multiparty from 'multiparty';
import FileType from 'file-type';
import FilesystemStoreEngine from './upload/filesystem';
import DatabaseStoreEngine from './upload/database';
import Ajv, { JSONSchemaType } from 'ajv';
import { Logger } from 'winston';
import { Response } from 'express-serve-static-core';
import { errorHandler } from '@backstage/backend-common';
import { AuthenticationError, NotAllowedError } from '@backstage/errors';
import { Config } from '@backstage/config';
import {
  getBearerTokenFromAuthorizationHeader,
  IdentityApi,
} from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  BasicPermission,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  qetaCreateAnswerPermission,
  qetaCreateQuestionPermission,
  qetaPermissions,
  qetaReadPermission,
  Statistic,
  StatisticResponse,
  StatisticsOptions,
} from '@drodil/backstage-plugin-qeta-common';

import {
  Attachment,
  MaybeAnswer,
  MaybeQuestion,
  QetaStore,
  QuestionsOptions,
} from '../database/QetaStore';
import { File } from './upload/types';
import { stringDateTime } from '../utils/utils';

export interface RouterOptions {
  identity: IdentityApi;
  database: QetaStore;
  logger: Logger;
  config: Config;
  permissions?: PermissionEvaluator;
}

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const DEFAULT_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

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
  favorite?: boolean;
  noVotes?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeTrend?: boolean;
  includeComments?: boolean;
  searchQuery?: string;
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
    favorite: { type: 'boolean', nullable: true },
    noVotes: { type: 'boolean', nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    includeAnswers: { type: 'boolean', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
    includeTrend: { type: 'boolean', nullable: true },
    includeComments: { type: 'boolean', nullable: true },
    searchQuery: { type: 'string', nullable: true },
  },
  required: [],
  additionalProperties: false,
};

interface PostQuestion {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
}

const PostQuestionSchema: JSONSchemaType<PostQuestion> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entities: { type: 'array', items: { type: 'string' }, nullable: true },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
  },
  required: ['title', 'content'],
  additionalProperties: false,
};

interface AnswerQuestion {
  answer: string;
  images?: number[];
}

const PostAnswerSchema: JSONSchemaType<AnswerQuestion> = {
  type: 'object',
  properties: {
    answer: { type: 'string', minLength: 1 },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
  },
  required: ['answer'],
  additionalProperties: false,
};

interface Comment {
  content: string;
}

const CommentSchema: JSONSchemaType<Comment> = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1 },
  },
  required: ['content'],
  additionalProperties: false,
};

export async function createRouter({
  logger,
  database,
  identity,
  config,
  permissions,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  router.use(bodyParser.urlencoded({ extended: true }));

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
    resp.comments = resp.comments?.map(c => {
      return { ...c, own: c.author === username };
    });
  };

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: qetaPermissions,
  });

  const checkPermissions = async (
    request: Request<unknown>,
    permission: BasicPermission,
  ): Promise<void> => {
    if (!permissions) {
      return;
    }

    const token =
      getBearerTokenFromAuthorizationHeader(request.header('authorization')) ||
      (request.cookies?.token as string | undefined);
    const decision = (
      await permissions.authorize([{ permission }], {
        token,
      })
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }
  };

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.use(permissionIntegrationRouter);

  // GET /questions
  router.get(`/questions`, async (request, response) => {
    // Validation
    const username = await getUsername(request);
    await checkPermissions(request, qetaReadPermission);
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
    const username = await getUsername(request);
    await checkPermissions(request, qetaReadPermission);
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
    const username = await getUsername(request);
    await checkPermissions(request, qetaReadPermission);
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

  // POST /questions/:id/comments
  router.post(`/questions/:id/comments`, async (request, response) => {
    // Validation
    // Act
    const username = await getUsername(request);
    await checkPermissions(request, qetaReadPermission);
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

  // DELETE /questions/:id/comments/:commentId
  router.delete(
    `/questions/:id/comments/:commentId`,
    async (request, response) => {
      // Validation
      // Act
      const username = await getUsername(request);
      await checkPermissions(request, qetaReadPermission);
      const question = await database.deleteQuestionComment(
        Number.parseInt(request.params.id, 10),
        Number.parseInt(request.params.commentId, 10),
        username,
      );

      if (question === null) {
        response.sendStatus(404);
        return;
      }

      mapAdditionalFields(username, question);
      question.answers?.map(a => mapAdditionalFields(username, a));

      // Response
      response.send(question);
    },
  );

  // POST /questions
  router.post(`/questions`, async (request, response) => {
    // Validation
    await checkPermissions(request, qetaCreateQuestionPermission);
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
      request.body.images,
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
      request.body.images,
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
    await checkPermissions(request, qetaCreateAnswerPermission);
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

    const username = await getUsername(request);
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

      const username = await getUsername(request);
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
      const username = await getUsername(request);
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
    const username = await getUsername(request);
    await checkPermissions(request, qetaReadPermission);
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

  // GET /questions/:id/favorite
  router.get(`/questions/:id/favorite`, async (request, response) => {
    const username = await getUsername(request);
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

    mapAdditionalFields(username, question);

    // Response
    response.send(question);
  });

  // GET /questions/:id/unfavorite
  router.get(`/questions/:id/unfavorite`, async (request, response) => {
    const username = await getUsername(request);
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

    mapAdditionalFields(username, question);

    // Response
    response.send(question);
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

  // POST /attachments
  router.post('/attachments', async (request, response) => {
    let attachment: Attachment;

    const storageType =
      config?.getOptionalString('qeta.storage.type') || 'database';
    const maxSizeImage =
      config?.getOptionalNumber('qeta.storage.maxSizeImage') ||
      DEFAULT_IMAGE_SIZE_LIMIT;
    const supportedFilesTypes =
      config?.getOptionalStringArray('qeta.storage.allowedMimeTypes') ||
      DEFAULT_MIME_TYPES;

    const form = new multiparty.Form();
    const fileSystemEngine = FilesystemStoreEngine({ config, database });
    const databaseEngine = DatabaseStoreEngine({ config, database });

    form.parse(request, async (err, _fields, files) => {
      if (err) {
        response.status(500).json({ errors: [{ message: err.message }] });
        return;
      }

      const fileRequest = files.image[0];
      const fileBuffer = await fs.promises.readFile(`${fileRequest?.path}`);
      const mimeType = await FileType.fromBuffer(fileBuffer);

      if (mimeType && !supportedFilesTypes.includes(mimeType.mime)) {
        response.status(400).json({
          errors: [
            { message: `Attachment type (${mimeType.mime}) not supported.` },
          ],
        });
        return;
      }

      if (fileBuffer.byteLength > maxSizeImage) {
        response.status(400).json({
          errors: [
            {
              message: `Attachment is larger than ${maxSizeImage} bytes. Try to make it smaller before uploading.`,
            },
          ],
        });
        return;
      }

      const file: File = {
        name: fileRequest.fieldName,
        path: fileRequest.path,
        buffer: fileBuffer,
        mimeType: mimeType?.mime.toString() || '',
        ext: mimeType?.ext.toString() || '',
        size: fileBuffer.byteLength || 0,
      };

      if (storageType === 'database') {
        attachment = await databaseEngine.handleFile(file);
        response.json(attachment);
      } else {
        attachment = await fileSystemEngine.handleFile(file);
        response.json(attachment);
      }
    });
  });

  // GET /attachments/:id
  router.get('/attachments/:uuid', async (request, response) => {
    const { uuid } = request.params;

    const attachment = await database.getAttachment(uuid);

    if (attachment) {
      let imageBuffer: Buffer;
      if (attachment.locationType === 'database') {
        imageBuffer = attachment.binaryImage;
      } else {
        imageBuffer = await fs.promises.readFile(attachment.path);
      }

      if (!imageBuffer) {
        response.status(500).send('Attachment buffer is undefined');
      }

      response.writeHead(200, {
        'Content-Type': attachment.mimeType,
        'Content-Length': imageBuffer ? imageBuffer.byteLength : '',
      });

      return response.end(imageBuffer);
    }
    return response.status(404).send('Attachment not found');
  });

  // GET /statistics/questions/top-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/questions/top-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await getUsername(request);

      const options: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
      };

      const mostUpvotedQuestions: Statistic[] =
        await database.getMostUpvotedQuestions({
          options,
        });

      const rankingResponse = {
        ranking: mostUpvotedQuestions,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedQuestions.find(userStats => {
        return userStats.author?.includes(userRef);
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedQuestions =
          await database.getMostUpvotedQuestions({
            author: userRef,
            options,
          });

        if (loggedUserUpvotedQuestions) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedQuestions.length > 0
              ? loggedUserUpvotedQuestions[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedQuestions.length > 0
              ? loggedUserUpvotedQuestions[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedQuestions.length === 1 ? 0 : mostUpvotedQuestions.length;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  // GET /statistics/answers/top-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/answers/top-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await getUsername(request);

      const options: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
      };

      const mostUpvotedAnswers: Statistic[] =
        await database.getMostUpvotedAnswers({
          options,
        });

      const rankingResponse = {
        ranking: mostUpvotedAnswers,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedAnswers.find(userStats => {
        return userStats.author?.includes(userRef);
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedAnswers = await database.getMostUpvotedAnswers({
          author: userRef,
          options,
        });

        if (loggedUserUpvotedAnswers) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedAnswers.length > 0
              ? loggedUserUpvotedAnswers[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedAnswers.length > 0
              ? loggedUserUpvotedAnswers[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedAnswers.length === 1 ? 0 : mostUpvotedAnswers.length;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  // GET /statistics/answers/top-correct-upvoted-users?period=x&limit=x
  router.get(
    '/statistics/answers/top-correct-upvoted-users',
    async (request, response) => {
      const { period, limit } = request.query;
      const userRef = await getUsername(request);

      const options: StatisticsOptions = {
        period: period && stringDateTime(period?.toString()),
        limit: Number(limit),
      };

      const mostUpvotedCorrectAnswers: Statistic[] =
        await database.getMostUpvotedCorrectAnswers({
          options,
        });

      const rankingResponse = {
        ranking: mostUpvotedCorrectAnswers,
        loggedUser: {},
      } as StatisticResponse;

      const findLoggerUserInData = mostUpvotedCorrectAnswers.find(userStats => {
        return userStats.author?.includes(userRef);
      });

      if (!findLoggerUserInData) {
        const loggedUserUpvotedCorrectAnswers =
          await database.getMostUpvotedCorrectAnswers({
            author: userRef,
            options,
          });

        if (loggedUserUpvotedCorrectAnswers) {
          rankingResponse.loggedUser!.author =
            loggedUserUpvotedCorrectAnswers.length > 0
              ? loggedUserUpvotedCorrectAnswers[0].author
              : userRef;

          rankingResponse.loggedUser!.total =
            loggedUserUpvotedCorrectAnswers.length > 0
              ? loggedUserUpvotedCorrectAnswers[0].total
              : 0;

          rankingResponse.loggedUser!.position =
            mostUpvotedCorrectAnswers.length === 1
              ? 0
              : mostUpvotedCorrectAnswers.length;
        }
      } else {
        rankingResponse.loggedUser = findLoggerUserInData;
      }

      return response.status(200).json(rankingResponse);
    },
  );

  router.use(errorHandler());
  return router;
}
