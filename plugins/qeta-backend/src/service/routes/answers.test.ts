import request from 'supertest';
import express from 'express';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  setupTestApp,
  question,
  answer,
  comment,
  answerWithComment,
  mockSystemDate,
} from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Answers Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;
  let mockedAuthorize: any;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
    mockedAuthorize = setup.mockedAuthorize;
  });

  describe('POST /posts/:id/answers', () => {
    it('creates new answer', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.answerPost.mockResolvedValue(answer);
      mockSystemDate(answer.created);

      const response = await request(app).post('/posts/1/answers').send({
        answer: 'content',
      });

      expect(response.status).toEqual(201);
      expect(qetaStore.answerPost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        'content',
        answer.created,
        undefined,
        false,
      );
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      const { app: appWithConfig, qetaStore: newQetaStore } =
        await setupTestApp({
          qeta: { allowMetadataInput: true },
        });
      newQetaStore.getPost.mockResolvedValue(question);
      newQetaStore.answerPost.mockResolvedValue(answer);

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(appWithConfig)
        .post('/posts/1/answers')
        .send({
          user: 'user2',
          answer: 'content',
          created: testDate.toISOString(),
        });

      expect(newQetaStore.answerPost).toHaveBeenCalledWith(
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
      qetaStore.getPost.mockResolvedValue(question);
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
      expect(response.status).toEqual(204);
    });

    it('delete failure', async () => {
      qetaStore.deleteAnswer.mockResolvedValue(false);
      const response = await request(app).delete('/posts/1/answers/2');
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/upvote', () => {
    it('votes answer up', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.voteAnswer.mockResolvedValue(true);

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
        ownVote: 1,
      });
    });

    it('vote fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
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
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.voteAnswer.mockResolvedValue(true);

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
        ownVote: -1,
      });
    });

    it('vote fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
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
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.markAnswerCorrect.mockResolvedValue(true);

      const response = await request(app).get('/posts/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer correct fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.markAnswerCorrect.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/correct');

      expect(qetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });

    it('allows user to be specified as a header if allowMetadataInput is true', async () => {
      const { app: appWithConfig, qetaStore: newQetaStore } =
        await setupTestApp({
          qeta: { allowMetadataInput: true },
        });
      newQetaStore.getPost.mockResolvedValue(question);
      newQetaStore.getAnswer.mockResolvedValue(answer);
      newQetaStore.markAnswerCorrect.mockResolvedValue(false);

      const response = await request(appWithConfig)
        .get('/posts/1/answers/2/correct')
        .set('x-qeta-user', 'another-user');
      expect(newQetaStore.markAnswerCorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /posts/:id/answers/:answerId/incorrect', () => {
    it('marks answer incorrect', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.markAnswerIncorrect.mockResolvedValue(true);

      const response = await request(app).get('/posts/1/answers/2/incorrect');

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(200);
    });

    it('marking answer incorrect fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.markAnswerIncorrect.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/answers/2/incorrect');

      expect(qetaStore.markAnswerIncorrect).toHaveBeenCalledWith(1, 2);
      expect(response.status).toEqual(404);
    });
  });

  describe('POST /posts/:id/answers/:answerId', () => {
    it('updates answer', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.updateAnswer.mockResolvedValue(answer);

      const response = await request(app)
        .post('/posts/1/answers/1')
        .send({ answer: 'updated answer' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /posts/:id/answers/:answerId/comments/:commentId', () => {
    it('updates answer comment', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.getComment.mockResolvedValue(comment);
      qetaStore.updateAnswerComment.mockResolvedValue(answerWithComment);

      const response = await request(app)
        .post('/posts/1/answers/1/comments/23')
        .send({ content: 'updated comment' });

      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(answerWithComment.id);
      expect(response.body.content).toEqual(answerWithComment.content);
      expect(response.body.created).toEqual('2022-01-01T00:00:00.000Z');
      expect(response.body.comments).toBeDefined();
    });
  });

  describe('DELETE /posts/:id/answers/:answerId/comments/:commentId', () => {
    it('deletes answer comment', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.getComment.mockResolvedValue(comment);
      qetaStore.deleteAnswerComment.mockResolvedValue(answer);

      const response = await request(app).delete(
        '/posts/1/answers/1/comments/23',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('GET /posts/:id/answers/:answerId', () => {
    it('returns specific answer', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);

      const response = await request(app).get('/posts/1/answers/1');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('DELETE /posts/:id/answers/:answerId/vote', () => {
    it('deletes answer vote', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getAnswer.mockResolvedValue(answer);
      qetaStore.deleteAnswerVote.mockResolvedValue(true);

      const response = await request(app).delete('/posts/1/answers/1/vote');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...answer,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('GET /answers', () => {
    it('returns list of answers', async () => {
      qetaStore.getAnswers.mockResolvedValue({
        answers: [],
        total: 0,
      });

      const response = await request(app).get('/answers');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ answers: [], total: 0 });
    });
  });

  describe('POST /answers/query', () => {
    it('queries answers with body parameters', async () => {
      qetaStore.getAnswers.mockResolvedValue({
        answers: [],
        total: 0,
      });

      const response = await request(app).post('/answers/query').send({
        limit: 10,
        offset: 0,
        author: 'user:default/test',
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ answers: [], total: 0 });
    });
  });
});
