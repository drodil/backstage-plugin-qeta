import request from 'supertest';
import express from 'express';
import {
  setupTestApp,
  question,
  mockSystemDate,
  collection,
} from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Collections Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /collections', () => {
    it('returns list of collections', async () => {
      qetaStore.getCollections.mockResolvedValue({
        collections: [],
        total: 0,
      });

      const response = await request(app).get('/collections');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ collections: [], total: 0 });
    });
  });

  describe('POST /collections/query', () => {
    it('queries collections with body parameters', async () => {
      qetaStore.getCollections.mockResolvedValue({
        collections: [],
        total: 0,
      });

      const response = await request(app).post('/collections/query').send({
        limit: 10,
        offset: 0,
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ collections: [], total: 0 });
    });
  });

  describe('POST /collections', () => {
    it('creates new collection', async () => {
      qetaStore.createCollection.mockResolvedValue(collection);
      mockSystemDate(collection.created);

      const response = await request(app).post('/collections').send({
        title: 'Test Collection',
        description: 'Test Description',
      });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...collection,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /collections/:id', () => {
    it('updates collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.updateCollection.mockResolvedValue(collection);

      const response = await request(app).post('/collections/1').send({
        title: 'Updated Collection',
        description: 'Updated Description',
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...collection,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('DELETE /collections/:id', () => {
    it('deletes collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.deleteCollection.mockResolvedValue(true);

      const response = await request(app).delete('/collections/1');

      expect(response.status).toEqual(204);
    });
  });

  describe('GET /collections/followed', () => {
    it('returns followed collections', async () => {
      qetaStore.getUserCollections.mockResolvedValue({
        collections: [],
        count: 0,
      });

      const response = await request(app).get('/collections/followed');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ collections: [], count: 0 });
    });
  });

  describe('PUT /collections/follow/:id', () => {
    it('follows collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.followCollection.mockResolvedValue(true);

      const response = await request(app).put('/collections/follow/1');

      expect(response.status).toEqual(204);
    });
  });

  describe('DELETE /collections/follow/:id', () => {
    it('unfollows collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.unfollowCollection.mockResolvedValue(true);

      const response = await request(app).delete('/collections/follow/1');

      expect(response.status).toEqual(204);
    });
  });

  describe('GET /collections/:id', () => {
    it('returns specific collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);

      const response = await request(app).get('/collections/1');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...collection,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /collections/:id/posts', () => {
    it('adds post to collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.addPostToCollection.mockResolvedValue(collection);

      const response = await request(app)
        .post('/collections/1/posts')
        .send({ postId: 1 });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...collection,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('DELETE /collections/:id/posts', () => {
    it('removes post from collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.removePostFromCollection.mockResolvedValue(collection);

      const response = await request(app)
        .delete('/collections/1/posts')
        .send({ postId: 1 });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...collection,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /collections/:id/rank/', () => {
    it('ranks post in collection', async () => {
      qetaStore.getCollection.mockResolvedValue(collection);
      qetaStore.getPost.mockResolvedValue(question);
      qetaStore.getPostRank.mockResolvedValue(2);
      qetaStore.getNextRankedPostId.mockResolvedValue({ postId: 1, rank: 1 });

      const response = await request(app)
        .post('/collections/1/rank/')
        .send({ postId: 1, rank: 'up' });

      expect(response.status).toEqual(200);
    });
  });
});
