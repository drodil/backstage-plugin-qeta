/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { QetaStore } from '../database/QetaStore';
import {
  Answer,
  Question,
  Comment,
} from '@drodil/backstage-plugin-qeta-common';
import {
  BackstageIdentityResponse,
  IdentityApi,
} from '@backstage/plugin-auth-node';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { Statistic } from '@drodil/backstage-plugin-qeta-common';

const mostUpvotedQuestions: Statistic[] = [
  {
    total: 5,
    author: 'user:default/captain_america',
    position: 1,
  },
  {
    total: 4,
    author: 'user:default/black_widow',
    position: 2,
  },
  {
    total: 2,
    author: 'user:default/spider_man',
    position: 3,
  },
];

const mostUpvotedAnswers: Statistic[] = [
  {
    total: 9,
    author: 'user:default/iron_man',
    position: 1,
  },
  {
    total: 8,
    author: 'user:default/john_doe',
    position: 2,
  },
  {
    total: 7,
    author: 'user:default/scarlet_witch',
    position: 3,
  },
];

const question: Question = {
  id: 1,
  score: 0,
  views: 122,
  author: 'user',
  title: 'title',
  content: 'content',
  favorite: false,
  created: new Date('2022-01-01T00:00:00Z'),
  answersCount: 0,
  correctAnswer: false,
};

const answer: Answer = {
  id: 1,
  questionId: 1,
  score: 0,
  author: 'user',
  content: 'content',
  correct: false,
  created: new Date('2022-01-01T00:00:00Z'),
};

const comment: Comment = {
  id: 23,
  author: 'user',
  content: 'content',
  created: new Date('2022-01-01T00:00:00Z'),
};

const answerWithComment: Answer = {
  ...answer,
  comments: [comment],
};

const questionWithComment: Question = {
  ...question,
  comments: [comment],
};

describe('createRouter', () => {
  let app: express.Express;

  const qetaStore: jest.Mocked<QetaStore> = {
    commentAnswer: jest.fn(),
    commentQuestion: jest.fn(),
    deleteAnswerComment: jest.fn(),
    deleteQuestionComment: jest.fn(),
    getQuestions: jest.fn(),
    getQuestion: jest.fn(),
    getQuestionByAnswerId: jest.fn(),
    postQuestion: jest.fn(),
    deleteQuestion: jest.fn(),
    answerQuestion: jest.fn(),
    getAnswer: jest.fn(),
    deleteAnswer: jest.fn(),
    voteQuestion: jest.fn(),
    voteAnswer: jest.fn(),
    markAnswerCorrect: jest.fn(),
    markAnswerIncorrect: jest.fn(),
    getTags: jest.fn(),
    updateQuestion: jest.fn(),
    updateAnswer: jest.fn(),
    favoriteQuestion: jest.fn(),
    unfavoriteQuestion: jest.fn(),
    postAttachment: jest.fn(),
    getAttachment: jest.fn(),
    getMostUpvotedAnswers: jest.fn(),
    getTotalAnswers: jest.fn(),
    getMostUpvotedQuestions: jest.fn(),
    getMostUpvotedCorrectAnswers: jest.fn(),
    getTotalQuestions: jest.fn(),
  };

  const getIdentityMock = jest
    .fn<Promise<BackstageIdentityResponse | undefined>, any>()
    .mockResolvedValue({
      identity: {
        userEntityRef: 'user:default/test',
        type: 'user',
        ownershipEntityRefs: [],
      },
      token: '5b18ce34-0aa0-4f28-acfc-18a78abdf66d',
    });

  const identityApi: jest.Mocked<IdentityApi> = {
    getIdentity: getIdentityMock,
  };

  const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
    jest.fn();
  const mockedPermissionQuery: jest.MockedFunction<
    PermissionEvaluator['authorizeConditional']
  > = jest.fn();

  const permissionEvaluator: PermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedPermissionQuery,
  };

  const mockSystemDate = (mockDate: Date) => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  };

  const buildApp = async (qetaConfig?: Record<string, string | object>) => {
    const config = ConfigReader.fromConfigs([
      { context: 'qeta', data: qetaConfig || {} },
    ]);
    const router = await createRouter({
      logger: getVoidLogger(),
      database: qetaStore,
      identity: identityApi,
      config,
      permissions: permissionEvaluator,
    });
    return express().use(router);
  };

  beforeEach(async () => {
    app = await buildApp();
    jest.restoreAllMocks();
    mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);
    getIdentityMock.mockResolvedValue({
      token: 'a',
      identity: {
        type: 'user',
        ownershipEntityRefs: [],
        userEntityRef: 'user',
      },
    });
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /questions', () => {
    it('returns list of questions', async () => {
      qetaStore.getQuestions.mockResolvedValue({
        questions: [],
        total: 0,
      });
      const response = await request(app).get('/questions');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ questions: [], total: 0 });
    });
  });

  describe('GET /questions/:id', () => {
    it('returns a question by id', async () => {
      qetaStore.getQuestion.mockResolvedValue(question);

      const response = await request(app).get('/questions/1');

      expect(qetaStore.getQuestion).toHaveBeenCalledWith('user', 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('not found', async () => {
      qetaStore.getQuestion.mockResolvedValue(null);
      const response = await request(app).get('/questions/1');
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1');
      expect(response.status).toEqual(401);
    });

    it('forbidden', async () => {
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app).get('/questions/1');
      expect(response.status).toEqual(403);
    });
  });

  describe('POST /questions', () => {
    it('creates new question', async () => {
      qetaStore.postQuestion.mockResolvedValue(question);
      mockSystemDate(question.created);

      const response = await request(app)
        .post('/questions')
        .send({
          title: 'title',
          content: 'content',
          tags: ['java'],
          entities: ['component:default/comp1'],
        });

      expect(qetaStore.postQuestion).toHaveBeenCalledWith(
        'user',
        'title',
        'content',
        question.created,
        ['java'],
        ['component:default/comp1'],
        undefined,
      );
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.postQuestion.mockResolvedValue(question);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app)
        .post('/questions')
        .send({
          user: 'user2',
          title: 'title',
          content: 'content',
          tags: ['java'],
          entities: ['component:default/comp1'],
          created: testDate.toISOString(),
        });

      expect(qetaStore.postQuestion).toHaveBeenCalledWith(
        'user2',
        'title',
        'content',
        testDate,
        ['java'],
        ['component:default/comp1'],
        undefined,
      );
      expect(response.status).toEqual(201);
    });

    it('invalid request', async () => {
      const response = await request(app).post('/questions').send({});
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errors: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'title'",
            params: {
              missingProperty: 'title',
            },
            schemaPath: '#/required',
          },
        ],
        type: 'body',
      });
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app)
        .post('/questions')
        .send({
          title: 'title',
          content: 'content',
          tags: ['java'],
        });
      expect(response.status).toEqual(401);
    });

    it('forbidden', async () => {
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app)
        .post('/questions')
        .send({
          title: 'title',
          content: 'content',
          tags: ['java'],
        });
      expect(response.status).toEqual(403);
    });
  });

  describe('DELETE /questions/:id', () => {
    it('deletes question', async () => {
      qetaStore.deleteQuestion.mockResolvedValue(true);
      const response = await request(app).delete('/questions/1');
      expect(response.status).toEqual(200);
    });

    it('delete failure', async () => {
      qetaStore.deleteQuestion.mockResolvedValue(false);
      const response = await request(app).delete('/questions/1');
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).delete('/questions/1');
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /questions/:id/comments', () => {
    it('posts a comment on the question', async () => {
      qetaStore.commentQuestion.mockResolvedValue(questionWithComment);
      mockSystemDate(answer.created);

      const response = await request(app).post(`/questions/1/comments`).send({
        content: 'content',
      });

      expect(response.status).toEqual(200);
      expect(qetaStore.commentQuestion).toHaveBeenCalledWith(
        1,
        'user',
        'content',
        question.created,
      );
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(questionWithComment)),
      );
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.commentQuestion.mockResolvedValue(questionWithComment);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app).post(`/questions/1/comments`).send({
        user: 'user2',
        content: 'content2',
        created: testDate.toISOString(),
      });

      expect(response.status).toEqual(200);
      expect(qetaStore.commentQuestion).toHaveBeenCalledWith(
        1,
        'user2',
        'content2',
        testDate,
      );
    });

    it('invalid request', async () => {
      const response = await request(app)
        .post(`/questions/1/comments`)
        .send({});
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errors: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'content'",
            params: {
              missingProperty: 'content',
            },
            schemaPath: '#/required',
          },
        ],
        type: 'body',
      });
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).post(`/questions/1/comments`).send({
        content: 'comment',
      });
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /questions/:id/answers', () => {
    it('posts answer', async () => {
      qetaStore.answerQuestion.mockResolvedValue(answer);
      mockSystemDate(answer.created);
      const response = await request(app).post('/questions/1/answers').send({
        answer: 'content',
      });

      expect(qetaStore.answerQuestion).toHaveBeenCalledWith(
        'user',
        1,
        'content',
        answer.created,
        undefined,
      );
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.answerQuestion.mockResolvedValue(answer);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app).post('/questions/1/answers').send({
        user: 'user2',
        answer: 'content',
        created: testDate.toISOString(),
      });

      expect(qetaStore.answerQuestion).toHaveBeenCalledWith(
        'user2',
        1,
        'content',
        testDate,
        undefined,
      );
      expect(response.status).toEqual(201);
    });

    it('invalid request', async () => {
      const response = await request(app).post('/questions/1/answers').send({});
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errors: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'answer'",
            params: {
              missingProperty: 'answer',
            },
            schemaPath: '#/required',
          },
        ],
        type: 'body',
      });
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).post('/questions/1/answers').send({
        answer: 'answer',
      });
      expect(response.status).toEqual(401);
    });

    it('forbidden', async () => {
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app).post('/questions/1/answers').send({
        answer: 'answer',
      });
      expect(response.status).toEqual(403);
    });
  });

  describe('DELETE /questions/:id/answers/:answerId', () => {
    it('deletes answer', async () => {
      qetaStore.deleteAnswer.mockResolvedValue(true);
      const response = await request(app).delete('/questions/1/answers/2');
      expect(response.status).toEqual(200);
    });

    it('delete failure', async () => {
      qetaStore.deleteAnswer.mockResolvedValue(false);
      const response = await request(app).delete('/questions/1/answers/2');
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).delete('/questions/1/answers/2');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/upvote', () => {
    it('votes question up', async () => {
      qetaStore.voteQuestion.mockResolvedValue(true);
      qetaStore.getQuestion.mockResolvedValue(question);

      const response = await request(app).get('/questions/1/upvote');

      expect(qetaStore.voteQuestion).toHaveBeenCalledWith('user', 1, 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteQuestion.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/upvote');

      expect(qetaStore.voteQuestion).toHaveBeenCalledWith('user', 1, 1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/upvote');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/downvote', () => {
    it('votes question down', async () => {
      qetaStore.voteQuestion.mockResolvedValue(true);
      qetaStore.getQuestion.mockResolvedValue(question);

      const response = await request(app).get('/questions/1/downvote');

      expect(qetaStore.voteQuestion).toHaveBeenCalledWith('user', 1, -1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteQuestion.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/downvote');

      expect(qetaStore.voteQuestion).toHaveBeenCalledWith('user', 1, -1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/downvote');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/favorite', () => {
    it('marks question favorite', async () => {
      qetaStore.favoriteQuestion.mockResolvedValue(true);
      qetaStore.getQuestion.mockResolvedValue(question);

      const response = await request(app).get('/questions/1/favorite');

      expect(qetaStore.favoriteQuestion).toHaveBeenCalledWith('user', 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('favorite fails', async () => {
      qetaStore.favoriteQuestion.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/favorite');

      expect(qetaStore.favoriteQuestion).toHaveBeenCalledWith('user', 1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/favorite');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/unfavorite', () => {
    it('unfavorite question', async () => {
      qetaStore.unfavoriteQuestion.mockResolvedValue(true);
      qetaStore.getQuestion.mockResolvedValue(question);

      const response = await request(app).get('/questions/1/unfavorite');

      expect(qetaStore.unfavoriteQuestion).toHaveBeenCalledWith('user', 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('unfavorite fails', async () => {
      qetaStore.unfavoriteQuestion.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/unfavorite');

      expect(qetaStore.unfavoriteQuestion).toHaveBeenCalledWith('user', 1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/unfavorite');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/answers/:answerId/upvote', () => {
    it('votes answer up', async () => {
      qetaStore.voteAnswer.mockResolvedValue(true);
      qetaStore.getAnswer.mockResolvedValue(answer);

      const response = await request(app).get('/questions/1/answers/2/upvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith('user', 2, 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteAnswer.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/answers/2/upvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith('user', 2, 1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/answers/2/upvote');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/answers/:answerId/downvote', () => {
    it('votes answer down', async () => {
      qetaStore.voteAnswer.mockResolvedValue(true);
      qetaStore.getAnswer.mockResolvedValue(answer);

      const response = await request(app).get(
        '/questions/1/answers/2/downvote',
      );

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith('user', 2, -1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteAnswer.mockResolvedValue(false);

      const response = await request(app).get(
        '/questions/1/answers/2/downvote',
      );

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith('user', 2, -1);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get(
        '/questions/1/answers/2/downvote',
      );
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/answers/:answerId/correct', () => {
    it('marks answer correct', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(true);

      const response = await request(app).get('/questions/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith('user', 1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer correct fails', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(false);

      const response = await request(app).get('/questions/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith('user', 1, 2);
      expect(response.status).toEqual(404);
    });

    it('allows user to be specified as a header if allowMetadataInput is true', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(false);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const response = await request(app)
        .get('/questions/1/answers/2/correct')
        .set('x-qeta-user', 'another-user');
      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(
        'another-user',
        1,
        2,
      );
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get('/questions/1/answers/2/correct');
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /questions/:id/answers/:answerId/incorrect', () => {
    it('marks answer incorrect', async () => {
      qetaStore.markAnswerIncorrect.mockResolvedValue(true);

      const response = await request(app).get(
        '/questions/1/answers/2/incorrect',
      );

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith('user', 1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer incorrect fails', async () => {
      qetaStore.markAnswerIncorrect.mockResolvedValue(false);

      const response = await request(app).get(
        '/questions/1/answers/2/incorrect',
      );

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith('user', 1, 2);
      expect(response.status).toEqual(404);
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app).get(
        '/questions/1/answers/2/incorrect',
      );
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /questions/:id/answers/:answerId/comments', () => {
    it('posts a comment on the answer', async () => {
      qetaStore.commentAnswer.mockResolvedValue(answerWithComment);
      mockSystemDate(answer.created);

      const response = await request(app)
        .post(`/questions/1/answers/1/comments`)
        .send({
          content: 'content',
        });

      expect(response.status).toEqual(201);
      expect(qetaStore.commentAnswer).toHaveBeenCalledWith(
        1,
        'user',
        'content',
        answer.created,
      );
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(answerWithComment)),
      );
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.commentAnswer.mockResolvedValue(answerWithComment);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app)
        .post(`/questions/1/answers/1/comments`)
        .send({
          user: 'user2',
          content: 'content2',
          created: testDate.toISOString(),
        });

      expect(response.status).toEqual(201);
      expect(qetaStore.commentAnswer).toHaveBeenCalledWith(
        1,
        'user2',
        'content2',
        testDate,
      );
    });

    it('invalid request', async () => {
      const response = await request(app)
        .post(`/questions/1/answers/1/comments`)
        .send({});
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errors: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'content'",
            params: {
              missingProperty: 'content',
            },
            schemaPath: '#/required',
          },
        ],
        type: 'body',
      });
    });

    it('unauthorized', async () => {
      getIdentityMock.mockResolvedValue(undefined);
      const response = await request(app)
        .post(`/questions/1/answers/1/comments`)
        .send({
          content: 'comment',
        });
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /statistics/questions/top-upvoted-users', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('returns the users with the best voted questions', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/thor',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedQuestions.mockResolvedValueOnce(
        mostUpvotedQuestions,
      );

      qetaStore.getMostUpvotedQuestions.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/thor',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/questions/top-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/captain_america',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedQuestions.mockResolvedValueOnce(
        mostUpvotedQuestions,
      );

      const response = await request(app).get(
        '/statistics/questions/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedQuestions).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual(
        'user:default/captain_america',
      );
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(5);
    });
  });

  describe('GET /statistics/answers/top-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted answers', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/thanos',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce(mostUpvotedAnswers);

      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/thanos',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/answers/top-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/iron_man',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce(mostUpvotedAnswers);

      const response = await request(app).get(
        '/statistics/answers/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/iron_man');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });

  describe('GET /statistics/answers/top-correct-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted correct answers', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/peter_parker',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce(
        mostUpvotedAnswers,
      );

      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/peter_parker',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/answers/top-correct-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      getIdentityMock.mockResolvedValueOnce({
        identity: {
          userEntityRef: 'user:default/iron_man',
          type: 'user',
          ownershipEntityRefs: [],
        },
        token: 'dummy',
      });

      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce(
        mostUpvotedAnswers,
      );

      const response = await request(app).get(
        '/statistics/answers/top-correct-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedCorrectAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/iron_man');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });
});
