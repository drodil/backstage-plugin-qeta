import request from 'supertest';
import express from 'express';
import { setupTestApp } from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';
import { mockServices } from '@backstage/backend-test-utils';

describe('Suggestions Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /suggestions', () => {
    it('returns suggestions and caches them', async () => {
      const cache = mockServices.cache.mock();

      const setup = await setupTestApp({}, cache);
      app = setup.app;
      qetaStore = setup.qetaStore;

      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      qetaStore.getUserTags.mockResolvedValue({ tags: [], count: 0 });
      qetaStore.getUserEntities.mockResolvedValue({ entityRefs: [], count: 0 });
      qetaStore.getFollowedUsers.mockResolvedValue({
        followedUserRefs: [],
        count: 0,
      });

      const response = await request(app).get('/suggestions');

      expect(response.status).toEqual(200);
      expect(response.body.suggestions).toBeDefined();
      expect(cache.get).toHaveBeenCalledWith(
        expect.stringContaining('qeta:suggestions:'),
      );
      expect(cache.set).toHaveBeenCalled();
    });

    it('returns cached suggestions if available', async () => {
      const cache = mockServices.cache.mock();
      cache.get.mockResolvedValue(
        JSON.stringify([{ id: 'test', type: 'test' }]),
      );

      const setup = await setupTestApp({}, cache);
      app = setup.app;
      qetaStore = setup.qetaStore;
      qetaStore.getPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });
      qetaStore.getUserTags.mockResolvedValue({ tags: [], count: 0 });
      qetaStore.getUserEntities.mockResolvedValue({ entityRefs: [], count: 0 });
      qetaStore.getFollowedUsers.mockResolvedValue({
        followedUserRefs: [],
        count: 0,
      });

      const response = await request(app).get('/suggestions');

      expect(response.status).toEqual(200);
      expect(response.body.suggestions).toHaveLength(1);
      expect(response.body.suggestions[0].id).toBe('test');
      expect(cache.get).toHaveBeenCalled();
    });
  });
});
