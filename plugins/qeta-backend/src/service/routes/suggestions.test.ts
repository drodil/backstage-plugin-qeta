import request from 'supertest';
import express from 'express';
import { setupTestApp } from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Suggestions Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /suggestions', () => {
    it('returns suggestions', async () => {
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
    });
  });
});
