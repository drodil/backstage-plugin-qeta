import request from 'supertest';
import express from 'express';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  answer,
  comment,
  mockSystemDate,
  question,
  questionWithComment,
  setupTestApp,
} from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Posts Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;
  let mockedAuthorize: any;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
    mockedAuthorize = setup.mockedAuthorize;
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

      expect(qetaStore.getPost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        true,
        expect.objectContaining({
          includeHealth: true,
          reviewThresholdMs: 15552000000,
        }),
      );
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
          status: 'active',
        });
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
      expect(response.status).toEqual(201);

      expect(qetaStore.createPost).toHaveBeenCalledWith({
        user_ref: 'user:default/mock',
        title: 'title',
        content: 'content',
        created: question.created,
        tags: ['java'],
        entities: ['component:default/comp1'],
        anonymous: false,
        status: 'active',
        type: 'question',
        opts: {
          includeAnswers: false,
          includeComments: false,
          includeVotes: false,
        },
      });
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      const { app: appWithConfig, qetaStore: newQetaStore } =
        await setupTestApp({
          qeta: { allowMetadataInput: true },
        });
      newQetaStore.createPost.mockResolvedValue(question);

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(appWithConfig)
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

      expect(newQetaStore.createPost).toHaveBeenCalledWith({
        user_ref: 'user2',
        title: 'title',
        content: 'content',
        created: testDate,
        tags: ['java'],
        entities: ['component:default/comp1'],
        anonymous: false,
        type: 'question',
        status: 'active',
        opts: {
          includeAnswers: false,
          includeComments: false,
          includeVotes: false,
        },
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
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.deletePost.mockResolvedValue(true);
      const response = await request(app).delete('/posts/1');
      expect(response.status).toEqual(204);
    });

    it('delete failure', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.deletePost.mockResolvedValue(false);
      const response = await request(app).delete('/posts/1');
      expect(response.status).toEqual(404);
    });

    it('permanently deletes question when permanent flag is set and user is moderator', async () => {
      const { app: appWithConfig, qetaStore: storeWithConfig } =
        await setupTestApp({
          qeta: { moderators: ['user:default/mock'] },
        });

      storeWithConfig.getPost.mockResolvedValue(question);
      storeWithConfig.deletePost.mockResolvedValue(true);

      const response = await request(appWithConfig)
        .delete('/posts/1')
        .send({ permanent: true });

      expect(response.status).toEqual(204);
      expect(storeWithConfig.deletePost).toHaveBeenCalledWith(1, true);
    });
  });

  describe('POST /posts/:id (update post)', () => {
    it('updates a post successfully with same author', async () => {
      const originalPost = { ...question, author: 'user:default/mock' };
      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.updatePost.mockResolvedValue({
        ...originalPost,
        title: 'updated title',
      });
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(200);
      expect(qetaStore.updatePost).toHaveBeenCalled();
    });

    it('allows moderator to change post author', async () => {
      const { app: appWithConfig, qetaStore: storeWithConfig } =
        await setupTestApp({
          qeta: { moderators: ['user:default/mock'] },
        });

      const originalPost = {
        ...question,
        author: 'user:default/originalauthor',
      };
      const updatedPost = {
        ...originalPost,
        author: 'user:default/newauthor',
        title: 'updated title',
      };

      storeWithConfig.getPost.mockResolvedValue(originalPost);
      storeWithConfig.updatePost.mockResolvedValue(updatedPost);
      storeWithConfig.getTags.mockResolvedValue({ tags: [], total: 0 });

      const response = await request(appWithConfig)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          author: 'user:default/newauthor',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(200);
      expect(storeWithConfig.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          author: 'user:default/newauthor',
        }),
      );
    });

    it('prevents non-moderator from changing post author to different user', async () => {
      const originalPost = {
        ...question,
        author: 'user:default/originalauthor',
      };

      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      // Mock to deny moderate permission but allow other permissions
      mockedAuthorize.mockImplementation(async (requests: any) => {
        return requests.map((req: any) => {
          // Deny moderate permission
          if (req.permission.name === 'qeta.moderate') {
            return { result: AuthorizeResult.DENY };
          }
          return { result: AuthorizeResult.ALLOW };
        });
      });

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          author: 'user:default/newauthor',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(400);
      expect(qetaStore.updatePost).not.toHaveBeenCalled();
    });

    it('allows original author to keep their author field unchanged', async () => {
      const originalPost = {
        ...question,
        author: 'user:default/originalauthor',
      };

      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.updatePost.mockResolvedValue({
        ...originalPost,
        title: 'updated title',
      });
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          author: 'user:default/originalauthor',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(200);
      expect(qetaStore.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          author: 'user:default/originalauthor',
        }),
      );
    });

    it('allows current user to keep their author field unchanged', async () => {
      const originalPost = {
        ...question,
        author: 'user:default/otherusert',
      };

      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.updatePost.mockResolvedValue({
        ...originalPost,
        title: 'updated title',
      });
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          author: 'user:default/mock',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(200);
      expect(qetaStore.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          author: 'user:default/mock',
        }),
      );
    });

    it('prevents update when user lacks edit permission', async () => {
      const originalPost = { ...question, author: 'user:default/otherusert' };
      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      // Simply deny the authorization - this will trigger the throwOnDeny behavior
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.DENY }]);

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(403);
      expect(qetaStore.updatePost).not.toHaveBeenCalled();
    });

    it('allows update when user has edit permission', async () => {
      const originalPost = { ...question, author: 'user:default/otherusert' };
      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.updatePost.mockResolvedValue({
        ...originalPost,
        title: 'updated title',
      });
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });
      mockedAuthorize.mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          tags: ['java'],
          type: 'question',
        });

      expect(response.status).toEqual(200);
      expect(qetaStore.updatePost).toHaveBeenCalled();
    });

    it('prevents non-moderator from changing status from active to deleted', async () => {
      const originalPost = {
        ...question,
        author: 'user:default/mock',
        status: 'active' as const,
      };

      qetaStore.getPost.mockResolvedValue(originalPost);
      qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

      // Mock to deny moderate permission but allow other permissions
      mockedAuthorize.mockImplementation(async (requests: any) => {
        return requests.map((req: any) => {
          // Deny moderate permission
          if (req.permission.name === 'qeta.moderate') {
            return { result: AuthorizeResult.DENY };
          }
          return { result: AuthorizeResult.ALLOW };
        });
      });

      const response = await request(app)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          tags: ['java'],
          type: 'question',
          status: 'deleted',
        });

      expect(response.status).toEqual(400);
      expect(qetaStore.updatePost).not.toHaveBeenCalled();
    });

    it('allows moderator to change status from active to deleted', async () => {
      const { app: appWithConfig, qetaStore: storeWithConfig } =
        await setupTestApp({
          qeta: { moderators: ['user:default/mock'] },
        });

      const originalPost = {
        ...question,
        author: 'user:default/mock',
        status: 'active' as const,
      };
      const updatedPost = {
        ...originalPost,
        status: 'deleted' as const,
      };

      storeWithConfig.getPost.mockResolvedValue(originalPost);
      storeWithConfig.updatePost.mockResolvedValue(updatedPost);
      storeWithConfig.getTags.mockResolvedValue({ tags: [], total: 0 });

      const response = await request(appWithConfig)
        .post('/posts/1')
        .send({
          title: 'updated title',
          content: 'updated content',
          tags: ['java'],
          type: 'question',
          status: 'deleted',
        });

      expect(response.status).toEqual(200);
      expect(storeWithConfig.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'deleted',
        }),
      );
    });
  });

  describe('POST /posts/:id/comments', () => {
    it('posts a comment on the question', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.commentPost.mockResolvedValue(questionWithComment);
      mockSystemDate(answer.created);

      const response = await request(app).post(`/posts/1/comments`).send({
        content: 'content',
      });

      expect(response.status).toEqual(201);
      expect(qetaStore.commentPost).toHaveBeenCalledWith(
        1,
        'user:default/mock',
        'content',
        question.created,
        {},
      );
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(questionWithComment)),
      );
    });

    it('allows user and created to be specified if allowMetadataInput is true', async () => {
      const { app: appWithConfig, qetaStore: newQetaStore } =
        await setupTestApp({
          qeta: { allowMetadataInput: true },
        });
      newQetaStore.getPost.mockResolvedValue(question);
      newQetaStore.commentPost.mockResolvedValue(questionWithComment);

      const testDate = new Date('1999-01-01T00:00:00.000Z');
      const response = await request(appWithConfig)
        .post(`/posts/1/comments`)
        .send({
          user: 'user2',
          content: 'content2',
          created: testDate.toISOString(),
        });

      expect(response.status).toEqual(201);
      expect(newQetaStore.commentPost).toHaveBeenCalledWith(
        1,
        'user2',
        'content2',
        testDate,
        {},
      );
    });

    it('invalid request', async () => {
      qetaStore.getPost.mockResolvedValue(question);
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

  describe('POST /posts/query', () => {
    it('queries posts with body parameters', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const response = await request(app).post('/posts/query').send({
        limit: 10,
        offset: 0,
        author: 'user:default/test',
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });
  });

  describe('GET /posts/list/:type', () => {
    it('returns unanswered questions', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const response = await request(app).get('/posts/list/unanswered');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });

    it('returns incorrect questions', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const response = await request(app).get('/posts/list/incorrect');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });

    it('returns hot questions', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const response = await request(app).get('/posts/list/hot');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });

    it('returns own questions', async () => {
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const response = await request(app).get('/posts/list/own');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ posts: [], total: 0 });
    });
  });

  describe('POST /posts/:id/restore', () => {
    it('restores a deleted post', async () => {
      qetaStore.getPost.mockResolvedValue({
        ...question,
        status: 'deleted',
      });
      qetaStore.updatePost.mockResolvedValue(question);

      const response = await request(app).post('/posts/1/restore');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });

    it('permanently deletes post comment when permanent flag is set and user is moderator', async () => {
      const { app: appWithConfig, qetaStore: storeWithConfig } =
        await setupTestApp({
          qeta: { moderators: ['user:default/mock'] },
        });

      storeWithConfig.getPost.mockResolvedValue(question);
      storeWithConfig.getComment.mockResolvedValue(comment);
      storeWithConfig.deletePostComment.mockResolvedValue(question);

      const response = await request(appWithConfig)
        .delete('/posts/1/comments/23')
        .send({ permanent: true });

      expect(response.status).toEqual(200);
      expect(storeWithConfig.deletePostComment).toHaveBeenCalledWith(
        1,
        23,
        'user:default/mock',
        true,
        expect.any(Object),
      );
    });
  });

  describe('DELETE /posts/:id/vote', () => {
    it('deletes post vote', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.deletePostVote.mockResolvedValue(true);

      const response = await request(app).delete('/posts/1/vote');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /posts/:id/comments/:commentId', () => {
    it('updates post comment', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getComment.mockResolvedValue(comment);
      qetaStore.updatePostComment.mockResolvedValue(questionWithComment);

      const response = await request(app)
        .post('/posts/1/comments/23')
        .send({ content: 'updated content' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(questionWithComment)),
      );
    });
  });

  describe('DELETE /posts/:id/comments/:commentId', () => {
    it('deletes post comment', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getComment.mockResolvedValue(comment);
      qetaStore.deletePostComment.mockResolvedValue(question);

      const response = await request(app).delete('/posts/1/comments/23');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('GET /posts/:id/upvote', () => {
    it('votes question up', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.votePost.mockResolvedValue(true);

      const response = await request(app).get('/posts/1/upvote');

      expect(qetaStore.votePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
        1,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...question,
        created: '2022-01-01T00:00:00.000Z',
        ownVote: 1,
      });
    });

    it('vote fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
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
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.votePost.mockResolvedValue(true);

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
        ownVote: -1,
      });
    });

    it('vote fails', async () => {
      qetaStore.getPost.mockResolvedValue(question);
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
    it('favorites question', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.favoritePost.mockResolvedValue(true);

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
      qetaStore.getPost.mockResolvedValue(question);
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
    it('unfavorites question', async () => {
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.unfavoritePost.mockResolvedValue(true);

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
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.unfavoritePost.mockResolvedValue(false);

      const response = await request(app).get('/posts/1/unfavorite');

      expect(qetaStore.unfavoritePost).toHaveBeenCalledWith(
        'user:default/mock',
        1,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('Link Update Functionality', () => {
    beforeEach(() => {
      qetaStore.updatePostLinks.mockResolvedValue();
      qetaStore.updateCommentLinks.mockResolvedValue();
    });

    describe('POST /posts - link extraction', () => {
      it('calls updatePostLinks with post content after creating post', async () => {
        const contentWithLinks =
          'Check /qeta/questions/123 and /qeta/articles/456';
        qetaStore.createPost.mockResolvedValue({
          ...question,
          content: contentWithLinks,
        });
        mockSystemDate(question.created);

        await request(app).post('/posts').send({
          title: 'title',
          content: contentWithLinks,
          type: 'question',
        });

        // Wait for async operation
        await new Promise(resolve => setImmediate(resolve));

        expect(qetaStore.updatePostLinks).toHaveBeenCalledWith(question.id, [
          { id: 123, type: 'question' },
          { id: 456, type: 'article' },
        ]);
      });

      it('handles posts without links gracefully', async () => {
        const contentWithoutLinks = 'This is plain text without any links';
        qetaStore.createPost.mockResolvedValue({
          ...question,
          content: contentWithoutLinks,
        });
        mockSystemDate(question.created);

        await request(app).post('/posts').send({
          title: 'title',
          content: contentWithoutLinks,
          type: 'question',
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(qetaStore.updatePostLinks).toHaveBeenCalledWith(question.id, []);
      });
    });

    describe('POST /posts/:id - link extraction on update', () => {
      it('calls updatePostLinks with updated content', async () => {
        const updatedContent = 'Updated with /qeta/questions/789';
        const originalPost = { ...question, author: 'user:default/mock' };
        qetaStore.getPost.mockResolvedValue(originalPost);
        qetaStore.updatePost.mockResolvedValue({
          ...originalPost,
          content: updatedContent,
        });
        qetaStore.getTags.mockResolvedValue({ tags: [], total: 0 });

        await request(app).post('/posts/1').send({
          title: 'title',
          content: updatedContent,
          type: 'question',
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(qetaStore.updatePostLinks).toHaveBeenCalledWith(question.id, [
          { id: 789, type: 'question' },
        ]);
      });
    });

    describe('POST /posts/:id/comments - link extraction', () => {
      it('calls updateCommentLinks after posting comment', async () => {
        const commentContent = 'See /qeta/articles/999';
        qetaStore.getPost.mockResolvedValue(question);
        qetaStore.commentPost.mockResolvedValue({
          ...questionWithComment,
          comments: [{ ...comment, id: 23, content: commentContent }],
        });
        mockSystemDate(answer.created);

        await request(app).post('/posts/1/comments').send({
          content: commentContent,
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(qetaStore.updateCommentLinks).toHaveBeenCalledWith(
          question.id,
          [{ id: 999, type: 'article' }],
          undefined,
          23,
        );
      });
    });

    describe('POST /posts/:id/comments/:commentId - link extraction on update', () => {
      it('calls updateCommentLinks after updating comment', async () => {
        const updatedCommentContent = 'Updated: /qeta/links/111';
        qetaStore.getPost.mockResolvedValue(question);
        qetaStore.getComment.mockResolvedValue(comment);
        qetaStore.updatePostComment.mockResolvedValue({
          ...questionWithComment,
          comments: [{ ...comment, content: updatedCommentContent }],
        });

        await request(app).post('/posts/1/comments/23').send({
          content: updatedCommentContent,
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(qetaStore.updateCommentLinks).toHaveBeenCalledWith(
          question.id,
          [{ id: 111, type: 'link' }],
          undefined,
          23,
        );
      });
    });
  });
});
