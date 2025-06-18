import request from 'supertest';
import express from 'express';
import { setupTestApp, question } from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('AI Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /ai/status', () => {
    it('returns AI status', async () => {
      const response = await request(app).get('/ai/status');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        enabled: false,
        existingQuestions: false,
        newQuestions: false,
        articleSummaries: false,
      });
    });
  });

  describe('GET /ai/question/:id', () => {
    it('returns 404 when AI handler not configured', async () => {
      qetaStore.getPost.mockResolvedValue(question);

      const response = await request(app).get('/ai/question/1');

      expect(response.status).toEqual(404);
    });
  });

  describe('POST /ai/question', () => {
    it('returns 404 when AI handler not configured', async () => {
      const response = await request(app).post('/ai/question').send({
        title: 'Test question',
        content: 'Test content',
      });

      expect(response.status).toEqual(404);
    });
  });

  describe('GET /ai/article/:id', () => {
    it('returns 404 when AI handler not configured', async () => {
      qetaStore.getPost.mockResolvedValue({
        ...question,
        type: 'article',
      });

      const response = await request(app).get('/ai/article/1');

      expect(response.status).toEqual(404);
    });
  });
});
