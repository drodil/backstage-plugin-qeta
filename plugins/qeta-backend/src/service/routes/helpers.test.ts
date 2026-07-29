import request from 'supertest';
import express from 'express';
import { setupTestApp } from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Helpers Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('Users Routes', () => {
    describe('GET /users', () => {
      it('returns list of users', async () => {
        qetaStore.getUsers.mockResolvedValue({
          users: [],
          total: 0,
        });

        const response = await request(app).get('/users');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ users: [], total: 0 });
      });

      it('zeros disabled content counters in user rows', async () => {
        const { app: disabledApp, qetaStore: disabledStore } =
          await setupTestApp({
            qeta: {
              questions: { disabled: true },
              articles: { disabled: true },
              links: { disabled: true },
            },
          });
        disabledStore.getUsers.mockResolvedValue({
          users: [
            {
              userRef: 'user:default/test',
              totalViews: 10,
              totalQuestions: 3,
              totalAnswers: 4,
              totalComments: 5,
              totalVotes: 6,
              totalArticles: 7,
              totalLinks: 8,
              reputation: 9,
              totalFollowers: 1,
              postScore: 2,
              answerScore: 3,
              correctAnswers: 1,
            },
          ],
          total: 1,
        });

        const response = await request(disabledApp).get('/users');

        expect(response.status).toEqual(200);
        expect(response.body.users[0]).toEqual(
          expect.objectContaining({
            totalQuestions: 0,
            totalAnswers: 0,
            totalArticles: 0,
            totalLinks: 0,
          }),
        );
      });
    });

    describe('GET /users/followed', () => {
      it('returns followed users', async () => {
        qetaStore.getFollowedUsers.mockResolvedValue({
          followedUserRefs: [],
          count: 0,
        });

        const response = await request(app).get('/users/followed');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ followedUserRefs: [], count: 0 });
      });
    });

    describe('PUT /users/follow/:userRef', () => {
      it('follows user', async () => {
        qetaStore.followUser.mockResolvedValue(true);

        const response = await request(app).put(
          '/users/follow/user:default/test',
        );

        expect(response.status).toEqual(204);
      });
    });

    describe('DELETE /users/follow/:userRef', () => {
      it('unfollows user', async () => {
        qetaStore.unfollowUser.mockResolvedValue(true);

        const response = await request(app).delete(
          '/users/follow/user:default/test',
        );

        expect(response.status).toEqual(204);
      });
    });
  });

  describe('Tags Routes', () => {
    describe('GET /tags', () => {
      it('returns list of tags', async () => {
        qetaStore.getTags.mockResolvedValue({
          tags: [],
          total: 0,
        });

        const response = await request(app).get('/tags');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ tags: [], total: 0 });
      });

      it('returns empty response when tags are disabled', async () => {
        const { app: disabledApp, qetaStore: disabledStore } =
          await setupTestApp({
            qeta: { tags: { disabled: true } },
          });

        const response = await request(disabledApp).get('/tags');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ tags: [], total: 0 });
        expect(disabledStore.getTags).not.toHaveBeenCalled();
      });
    });

    describe('GET /tags/followed', () => {
      it('returns followed tags', async () => {
        qetaStore.getUserTags.mockResolvedValue({ tags: [], count: 0 });

        const response = await request(app).get('/tags/followed');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ tags: [], count: 0 });
      });
    });

    describe('PUT /tags/follow/:tag', () => {
      it('follows tag', async () => {
        qetaStore.followTag.mockResolvedValue(true);

        const response = await request(app).put('/tags/follow/test-tag');

        expect(response.status).toEqual(204);
      });

      it('returns 403 when tags are disabled', async () => {
        const { app: disabledApp, qetaStore: disabledStore } =
          await setupTestApp({
            qeta: { tags: { disabled: true } },
          });

        const response = await request(disabledApp).put(
          '/tags/follow/test-tag',
        );

        expect(response.status).toEqual(403);
        expect(disabledStore.followTag).not.toHaveBeenCalled();
      });
    });

    describe('DELETE /tags/follow/:tag', () => {
      it('unfollows tag', async () => {
        qetaStore.unfollowTag.mockResolvedValue(true);

        const response = await request(app).delete('/tags/follow/test-tag');

        expect(response.status).toEqual(204);
      });
    });

    describe('POST /tags/suggest', () => {
      it('suggests tags', async () => {
        qetaStore.getTags.mockResolvedValue({
          tags: [],
          total: 0,
        });

        const response = await request(app).post('/tags/suggest').send({
          title: 'Test question',
          content: 'Test content',
        });

        expect(response.status).toEqual(200);
        expect(response.body.tags).toBeDefined();
      });
    });

    describe('GET /tags/:tag', () => {
      it('returns specific tag', async () => {
        const tag = {
          id: 1,
          tag: 'test-tag',
          description: 'Test description',
          experts: [],
          postsCount: 5,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 3,
        };
        qetaStore.getTag.mockResolvedValue(tag);

        const response = await request(app).get('/tags/test-tag');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(tag);
      });
    });

    describe('POST /tags/:tag', () => {
      it('updates tag', async () => {
        const tag = {
          id: 1,
          tag: 'test-tag',
          description: 'Updated description',
          experts: [],
          postsCount: 5,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 3,
        };
        qetaStore.getTagById.mockResolvedValue(tag);
        qetaStore.updateTag.mockResolvedValue(tag);

        const response = await request(app).post('/tags/1').send({
          description: 'Updated description',
        });

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(tag);
      });
    });

    describe('PUT /tags', () => {
      it('creates new tag', async () => {
        const tag = {
          id: 1,
          tag: 'new-tag',
          description: 'New tag description',
          experts: [],
          postsCount: 0,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 0,
        };
        qetaStore.getTag.mockResolvedValue(null);
        qetaStore.createTag.mockResolvedValue(tag);

        const response = await request(app).put('/tags').send({
          tag: 'new-tag',
          description: 'New tag description',
        });

        expect(response.status).toEqual(201);
        expect(response.body).toEqual(tag);
      });
    });

    describe('DELETE /tags/:tag', () => {
      it('deletes tag', async () => {
        const tag = {
          id: 1,
          tag: 'test-tag',
          description: 'Test description',
          experts: [],
          postsCount: 5,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 3,
        };
        qetaStore.getTagById.mockResolvedValue(tag);
        qetaStore.deleteTag.mockResolvedValue(true);

        const response = await request(app).delete('/tags/1');

        expect(response.status).toEqual(204);
      });
    });
  });

  describe('Entities Routes', () => {
    describe('GET /entities', () => {
      it('returns list of entities', async () => {
        qetaStore.getEntities.mockResolvedValue({
          entities: [],
          total: 0,
        });

        const response = await request(app).get('/entities');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ entities: [], total: 0 });
      });

      it('returns empty response when entities are disabled', async () => {
        const { app: disabledApp, qetaStore: disabledStore } =
          await setupTestApp({
            qeta: { entities: { disabled: true } },
          });

        const response = await request(disabledApp).get('/entities');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ entities: [], total: 0 });
        expect(disabledStore.getEntities).not.toHaveBeenCalled();
      });
    });

    describe('GET /entities/followed', () => {
      it('returns followed entities', async () => {
        qetaStore.getUserEntities.mockResolvedValue({
          entityRefs: [],
          count: 0,
        });

        const response = await request(app).get('/entities/followed');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ entityRefs: [], count: 0 });
      });
    });

    describe('PUT /entities/follow/:entityRef', () => {
      it('follows entity', async () => {
        qetaStore.followEntity.mockResolvedValue(true);

        const response = await request(app).put(
          '/entities/follow/component:default/test',
        );

        expect(response.status).toEqual(204);
      });
    });

    describe('DELETE /entities/follow/:entityRef', () => {
      it('unfollows entity', async () => {
        qetaStore.unfollowEntity.mockResolvedValue(true);

        const response = await request(app).delete(
          '/entities/follow/component:default/test',
        );

        expect(response.status).toEqual(204);
      });
    });

    describe('GET /entities/:entityRef', () => {
      it('returns specific entity', async () => {
        const entity = {
          id: 1,
          entityRef: 'component:default/test',
          postsCount: 5,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 3,
        };
        qetaStore.getEntity.mockResolvedValue(entity);

        const response = await request(app).get(
          '/entities/component:default/test',
        );

        expect(response.status).toEqual(200);
      });
    });
  });
});
