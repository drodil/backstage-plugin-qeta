/*
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

import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { QetaStore } from '../database/QetaStore';
import {
  Answer,
  Comment,
  Post,
  Statistic,
} from '@drodil/backstage-plugin-qeta-common';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { mockServices } from '@backstage/backend-test-utils';

const mostUpvotedQuestions: Statistic[] = [
  {
    total: 5,
    author: 'user:default/mock',
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
    author: 'user:default/mock',
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

const question: Post = {
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
  type: 'question',
  images: [],
};

const answer: Answer = {
  id: 1,
  postId: 1,
  score: 0,
  author: 'user',
  content: 'content',
  correct: false,
  created: new Date('2022-01-01T00:00:00Z'),
  images: [],
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

const questionWithComment: Post = {
  ...question,
  comments: [comment],
};

describe('createRouter', () => {
  let app: express.Express;

  const qetaStore: jest.Mocked<QetaStore> = {
    commentAnswer: jest.fn(),
    commentPost: jest.fn(),
    deleteAnswerComment: jest.fn(),
    deletePostComment: jest.fn(),
    getPosts: jest.fn(),
    getPost: jest.fn(),
    getQuestionByAnswerId: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    answerPost: jest.fn(),
    getAnswer: jest.fn(),
    deleteAnswer: jest.fn(),
    votePost: jest.fn(),
    voteAnswer: jest.fn(),
    markAnswerCorrect: jest.fn(),
    markAnswerIncorrect: jest.fn(),
    getTags: jest.fn(),
    getEntities: jest.fn(),
    updatePost: jest.fn(),
    updateAnswer: jest.fn(),
    favoritePost: jest.fn(),
    unfavoritePost: jest.fn(),
    postAttachment: jest.fn(),
    getAnswers: jest.fn(),
    getAttachment: jest.fn(),
    getMostUpvotedAnswers: jest.fn(),
    getTotalAnswers: jest.fn(),
    getMostUpvotedPosts: jest.fn(),
    getMostUpvotedCorrectAnswers: jest.fn(),
    getTotalPosts: jest.fn(),
    followTag: jest.fn(),
    unfollowTag: jest.fn(),
    getUserTags: jest.fn(),
    getUsersForTags: jest.fn(),
    followEntity: jest.fn(),
    unfollowEntity: jest.fn(),
    getUserEntities: jest.fn(),
    getUsersForEntities: jest.fn(),
    getAnswerComment: jest.fn(),
    getPostComment: jest.fn(),
    getFollowingUsers: jest.fn(),
  } as unknown as jest.Mocked<QetaStore>;

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
      logger: mockServices.logger.mock(),
      httpAuth: mockServices.httpAuth(),
      userInfo: mockServices.userInfo(),
      discovery: mockServices.discovery(),
      database: qetaStore,
      config,
      permissions: permissionEvaluator,
    });
    return express().use(router);
  };

  beforeEach(async () => {
    app = await buildApp();
    jest.restoreAllMocks();
    mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);
    mockedPermissionQuery.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /posts', () => {
    it('returns list of questions', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      const response = await request(app).get('/posts');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });
    it('returns 400 error when date range is invalid', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      const response = await request(app).get(
        '/posts?fromDate=2024-05-10&toDate=2024-05-04',
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'From Date should be less than To Date',
        isValid: false,
      });
    });
    it('returns 400 error when fromDate provided but not toDate', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      const response = await request(app).get('/posts?fromDate=2024-05-10');
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'Please enter to date in format YYYY-MM-DD',
        isValid: false,
        field: 'toDate',
      });
    });
    it('returns 400 error when toDate provided but not fromDate', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      const response = await request(app).get('/posts?toDate=2024-05-10');
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'Please enter from date in format YYYY-MM-DD',
        isValid: false,
        field: 'fromDate',
      });
    });
    it('returns 400 error when fromDate is invalid', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      const response = await request(app).get(
        '/posts?fromDate=2024-22-10&toDate=2024-05-10',
      );
      expect(response.status).toEqual(400);
      expect(response.body.errors[0].message).toEqual(
        'must match format "date"',
      );
    });
  });

  describe('GET /posts/:id', () => {
    it('returns a question by id', async () => {
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get('/posts/1');

      expect(qetaStore.getPost).toHaveBeenCalledWith('user:default/mock', 1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('not found', async () => {
      qetaStore.getPost.mockResolvedValue(null);
      const response = await request(app).get('/posts/1');
      expect(response.status).toEqual(404);
    });

    it('forbidden', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app).get('/posts/1');
      expect(response.status).toEqual(403);
    });
  });

  describe('POST /posts', () => {
    it('creates new question', async () => {
      qetaStore.createPost.mockResolvedValue(question);
      mockSystemDate(question.created);

      const response = await request(app)
        .post('/posts')
        .send({
          title: 'title',
          content: 'content',
          tags: ['java'],
          entities: ['component:default/comp1'],
          type: 'question',
        });

      expect(qetaStore.createPost).toHaveBeenCalledWith({
        user_ref: 'user:default/mock',
        title: 'title',
        content: 'content',
        created: question.created,
        tags: ['java'],
        entities: ['component:default/comp1'],
        anonymous: false,
        type: 'question',
      });
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.createPost.mockResolvedValue(question);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app)
        .post('/posts')
        .send({
          user: 'user2',
          title: 'title',
          content: 'content',
          tags: ['java'],
          entities: ['component:default/comp1'],
          created: testDate.toISOString(),
          type: 'question',
        });

      expect(qetaStore.createPost).toHaveBeenCalledWith({
        user_ref: 'user2',
        title: 'title',
        content: 'content',
        created: testDate,
        tags: ['java'],
        entities: ['component:default/comp1'],
        anonymous: false,
        type: 'question',
      });
      expect(response.status).toEqual(201);
    });

    it('invalid request', async () => {
      const response = await request(app).post('/posts').send({});
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

    it('forbidden', async () => {
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app)
        .post('/posts')
        .send({
          title: 'title',
          content: 'content',
          tags: ['java'],
        });
      expect(response.status).toEqual(403);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('deletes question', async () => {
      qetaStore.deletePost.mockResolvedValue(true);
      const response = await request(app).delete('/posts/1');
      expect(response.status).toEqual(200);
    });

    it('delete failure', async () => {
      qetaStore.deletePost.mockResolvedValue(false);
      const response = await request(app).delete('/posts/1');
      expect(response.status).toEqual(404);
    });
  });

  describe('POST /posts/:id/comments', () => {
    it('posts a comment on the question', async () => {
      qetaStore.commentPost.mockResolvedValue(questionWithComment);
      mockSystemDate(answer.created);

      const response = await request(app).post(`/posts/1/comments`).send({
        content: 'content',
      });

      expect(response.status).toEqual(200);
      expect(qetaStore.commentPost).toHaveBeenCalledWith(
        1,
        'user:default/mock',
        'content',
        question.created,
      );
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(questionWithComment)),
      );
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.commentPost.mockResolvedValue(questionWithComment);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app).post(`/posts/1/comments`).send({
        user: 'user2',
        content: 'content2',
        created: testDate.toISOString(),
      });

      expect(response.status).toEqual(200);
      expect(qetaStore.commentPost).toHaveBeenCalledWith(
        1,
        'user2',
        'content2',
        testDate,
      );
    });

    it('invalid request', async () => {
      const response = await request(app).post(`/posts/1/comments`).send({});
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
  });

  describe('POST /posts/:id/answers', () => {
    it('posts answer', async () => {
      qetaStore.answerPost.mockResolvedValue(answer);
      qetaStore.getPost.mockResolvedValue(question);
      mockSystemDate(answer.created);
      const response = await request(app).post('/posts/1/answers').send({
        answer: 'content',
      });

      expect(qetaStore.answerPost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        'content',
        answer.created,
        undefined,
        false,
      );
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      qetaStore.answerPost.mockResolvedValue(answer);
      qetaStore.getPost.mockResolvedValue(question);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(app).post('/posts/1/answers').send({
        user: 'user2',
        answer: 'content',
        created: testDate.toISOString(),
      });

      expect(qetaStore.answerPost).toHaveBeenCalledWith(
        'user2',
        1,
        'content',
        testDate,
        undefined,
        false,
      );
      expect(response.status).toEqual(201);
    });

    it('invalid request', async () => {
      const response = await request(app).post('/posts/1/answers').send({});
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

    it('forbidden', async () => {
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);
      const response = await request(app).post('/posts/1/answers').send({
        answer: 'answer',
      });
      expect(response.status).toEqual(403);
    });
  });

  describe('DELETE /posts/:id/answers/:answerId', () => {
    it('deletes answer', async () => {
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.deleteAnswer.mockResolvedValue(true);
      const response = await request(app).delete(
        `/posts/${question.id}/answers/${answer.id}`,
      );
      expect(response.status).toEqual(200);
    });

    it('delete failure', async () => {
      qetaStore.deleteAnswer.mockResolvedValue(false);
      const response = await request(app).delete('/posts/1/answers/2');
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/upvote', () => {
    it('votes question up', async () => {
      qetaStore.votePost.mockResolvedValue(true);
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get(`/posts/${question.id}/upvote`);

      expect(response.status).toEqual(200);
      expect(qetaStore.votePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        1,
      );
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.votePost.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/upvote');

      expect(qetaStore.votePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/downvote', () => {
    it('votes question down', async () => {
      qetaStore.votePost.mockResolvedValue(true);
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get('/posts/1/downvote');

      expect(qetaStore.votePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        -1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.votePost.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/downvote');

      expect(qetaStore.votePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        -1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/favorite', () => {
    it('marks question favorite', async () => {
      qetaStore.favoritePost.mockResolvedValue(true);
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get('/posts/1/favorite');

      expect(qetaStore.favoritePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('favorite fails', async () => {
      qetaStore.favoritePost.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/favorite');

      expect(qetaStore.favoritePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/unfavorite', () => {
    it('unfavorite question', async () => {
      qetaStore.unfavoritePost.mockResolvedValue(true);
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get('/posts/1/unfavorite');

      expect(qetaStore.unfavoritePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('unfavorite fails', async () => {
      qetaStore.unfavoritePost.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/unfavorite');

      expect(qetaStore.unfavoritePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/upvote', () => {
    it('votes answer up', async () => {
      qetaStore.voteAnswer.mockResolvedValue(true);
      qetaStore.getAnswer.mockResolvedValue(answer);

      const response = await request(app).get('/posts/1/answers/2/upvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith(
        'user:default/mock',
        2,
        1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteAnswer.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/upvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith(
        'user:default/mock',
        2,
        1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/downvote', () => {
    it('votes answer down', async () => {
      qetaStore.voteAnswer.mockResolvedValue(true);
      qetaStore.getAnswer.mockResolvedValue(answer);

      const response = await request(app).get('/posts/1/answers/2/downvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith(
        'user:default/mock',
        2,
        -1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('vote fails', async () => {
      qetaStore.voteAnswer.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/downvote');

      expect(qetaStore.voteAnswer).toHaveBeenCalledWith(
        'user:default/mock',
        2,
        -1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/correct', () => {
    it('marks answer correct', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(true);

      const response = await request(app).get('/posts/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer correct fails', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });

    it('allows user to be specified as a header if allowMetadataInput is true', async () => {
      qetaStore.markAnswerCorrect.mockResolvedValue(false);
      app = await buildApp({ qeta: { allowMetadataInput: true } });

      const response = await request(app)
        .get('/posts/1/answers/2/correct')
        .set('x-qeta-user', 'another-user');
      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/incorrect', () => {
    it('marks answer incorrect', async () => {
      qetaStore.markAnswerIncorrect.mockResolvedValue(true);

      const response = await request(app).get('/posts/1/answers/2/incorrect');

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer incorrect fails', async () => {
      qetaStore.markAnswerIncorrect.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/incorrect');

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });
  });

  describe('POST /posts/:id/answers/:answerId/comments', () => {
    it('posts a comment on the answer', async () => {
      qetaStore.commentAnswer.mockResolvedValue(answerWithComment);
      mockSystemDate(answer.created);

      const response = await request(app)
        .post(`/posts/1/answers/1/comments`)
        .send({
          content: 'content',
        });

      expect(response.status).toEqual(201);
      expect(qetaStore.commentAnswer).toHaveBeenCalledWith(
        1,
        'user:default/mock',
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
        .post(`/posts/1/answers/1/comments`)
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
        .post(`/posts/1/answers/1/comments`)
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
  });

  describe('GET /statistics/posts/top-upvoted-users', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('returns the users with the best voted questions', async () => {
      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce(mostUpvotedQuestions);

      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce([
        {
          total: 1,
          author: 'user:default/thor',
          position: 1,
        },
      ]);

      const response = await request(app).get(
        '/statistics/posts/top-upvoted-users',
      );

      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toBeDefined();
      expect(response.body.loggedUser.position).toBeDefined();
      expect(response.body.loggedUser.total).toBeDefined();
    });

    it('ensure that the position of the logged user is equal to the ranking', async () => {
      qetaStore.getMostUpvotedPosts.mockResolvedValueOnce(mostUpvotedQuestions);

      const response = await request(app).get(
        '/statistics/posts/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedPosts).toHaveBeenCalledTimes(3);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(0);
      expect(response.body.loggedUser.total).toEqual(5);
    });
  });

  describe('GET /statistics/answers/top-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted answers', async () => {
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
      qetaStore.getMostUpvotedAnswers.mockResolvedValueOnce(mostUpvotedAnswers);

      const response = await request(app).get(
        '/statistics/answers/top-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });

  describe('GET /statistics/answers/top-correct-upvoted-users', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns the users with the best voted correct answers', async () => {
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
      qetaStore.getMostUpvotedCorrectAnswers.mockResolvedValueOnce(
        mostUpvotedAnswers,
      );

      const response = await request(app).get(
        '/statistics/answers/top-correct-upvoted-users',
      );

      expect(qetaStore.getMostUpvotedCorrectAnswers).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body.ranking.length).toBeGreaterThan(0);
      expect(response.body.loggedUser.author).toEqual('user:default/mock');
      expect(response.body.loggedUser.position).toEqual(1);
      expect(response.body.loggedUser.total).toEqual(9);
    });
  });
});
