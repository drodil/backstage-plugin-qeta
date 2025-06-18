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
