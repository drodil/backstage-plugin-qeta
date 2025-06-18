import request from 'supertest';
import { Express } from 'express';
import { setupTestApp, template as baseTemplate } from './__testUtils__';

describe('Templates Routes', () => {
  let app: Express;
  let qetaStore: any;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;
  });

  describe('GET /templates', () => {
    it('returns list of templates', async () => {
      qetaStore.getTemplates.mockResolvedValue({
        templates: [],
        total: 0,
      });

      const response = await request(app).get('/templates');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ templates: [], total: 0 });
    });
  });

  describe('GET /templates/:id', () => {
    it('returns specific template', async () => {
      const testTemplate = {
        ...baseTemplate,
        description: 'Test Description',
        questionTitle: 'Test Question',
        questionContent: 'Test Content',
        tags: ['test'],
        entities: ['component:default/test'],
      };
      qetaStore.getTemplate.mockResolvedValue(testTemplate);

      const response = await request(app).get('/templates/1');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...testTemplate,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /templates', () => {
    it('creates new template', async () => {
      const testTemplate = {
        ...baseTemplate,
        description: 'Test Description',
        questionTitle: 'Test Question',
        questionContent: 'Test Content',
        tags: ['test'],
        entities: ['component:default/test'],
      };
      qetaStore.createTemplate.mockResolvedValue(testTemplate);

      const response = await request(app)
        .post('/templates')
        .send({
          title: 'Test Template',
          description: 'Test Description',
          questionTitle: 'Test Question',
          questionContent: 'Test Content',
          tags: ['test'],
          entities: ['component:default/test'],
        });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        ...testTemplate,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('POST /templates/:id', () => {
    it('updates template', async () => {
      const testTemplate = {
        ...baseTemplate,
        title: 'Updated Template',
        description: 'Updated Description',
        questionTitle: 'Updated Question',
        questionContent: 'Updated Content',
        tags: ['updated'],
        entities: ['component:default/updated'],
      };
      qetaStore.getTemplate.mockResolvedValue(testTemplate);
      qetaStore.updateTemplate.mockResolvedValue(testTemplate);

      const response = await request(app)
        .post('/templates/1')
        .send({
          title: 'Updated Template',
          description: 'Updated Description',
          questionTitle: 'Updated Question',
          questionContent: 'Updated Content',
          tags: ['updated'],
          entities: ['component:default/updated'],
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...testTemplate,
        created: '2022-01-01T00:00:00.000Z',
      });
    });
  });

  describe('DELETE /templates/:id', () => {
    it('deletes template', async () => {
      const testTemplate = {
        ...baseTemplate,
        description: 'Test Description',
        questionTitle: 'Test Question',
        questionContent: 'Test Content',
        tags: ['test'],
        entities: ['component:default/test'],
      };
      qetaStore.getTemplate.mockResolvedValue(testTemplate);
      qetaStore.deleteTemplate.mockResolvedValue(true);

      const response = await request(app).delete('/templates/1');

      expect(response.status).toEqual(204);
    });
  });
});
