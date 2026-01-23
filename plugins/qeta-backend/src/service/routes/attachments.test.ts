import request from 'supertest';
import express from 'express';
import { globalMockEngine, setupTestApp } from './__testUtils__';
import { QetaStore } from '../../database/QetaStore';

describe('Attachments Routes', () => {
  let app: express.Express;
  let qetaStore: jest.Mocked<QetaStore>;

  beforeEach(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    qetaStore = setup.qetaStore;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /attachments/:uuid', () => {
    const mockAttachment = {
      id: 1,
      uuid: 'test-uuid-123',
      locationUri: 'test-location',
      locationType: 'database',
      path: '/test/path',
      extension: 'png',
      mimeType: 'image/png',
      binaryImage: Buffer.from('fake-image-data'),
      creator: 'user1',
      created: new Date('2024-01-01T00:00:00.000Z'),
    };

    it('returns attachment with proper cache headers', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);
      globalMockEngine.getAttachmentBuffer.mockResolvedValue(
        mockAttachment.binaryImage,
      );

      const response = await request(app).get('/attachments/test-uuid-123');

      expect(response.status).toEqual(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000, immutable',
      );
      expect(response.headers['last-modified']).toBeDefined();
      expect(response.headers.etag).toBeDefined();
      expect(response.headers['content-length']).toBeDefined();
    });

    it('returns 304 Not Modified when ETag matches', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);

      const etag = `"test-uuid-123-${mockAttachment.created.getTime()}"`;

      const response = await request(app)
        .get('/attachments/test-uuid-123')
        .set('If-None-Match', etag);

      expect(response.status).toEqual(304);
      expect(response.body).toEqual({});
    });

    it('returns 304 Not Modified when If-Modified-Since matches', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);

      const lastModified = mockAttachment.created.toUTCString();

      const response = await request(app)
        .get('/attachments/test-uuid-123')
        .set('If-Modified-Since', lastModified);

      expect(response.status).toEqual(304);
      expect(response.body).toEqual({});
    });

    it('returns 404 when attachment not found', async () => {
      qetaStore.getAttachment.mockResolvedValue(undefined);

      const response = await request(app).get('/attachments/non-existent');

      expect(response.status).toEqual(404);
      expect(response.text).toBe('Attachment not found');
    });

    it('returns attachment when ETag does not match', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);
      globalMockEngine.getAttachmentBuffer.mockResolvedValue(
        mockAttachment.binaryImage,
      );

      const response = await request(app)
        .get('/attachments/test-uuid-123')
        .set('If-None-Match', '"different-etag"');

      expect(response.status).toEqual(200);
      expect(response.headers.etag).toBeDefined();
    });

    it('generates consistent ETag from UUID and timestamp', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);
      globalMockEngine.getAttachmentBuffer.mockResolvedValue(
        mockAttachment.binaryImage,
      );

      const response1 = await request(app).get('/attachments/test-uuid-123');
      const response2 = await request(app).get('/attachments/test-uuid-123');

      expect(response1.status).toEqual(200);
      expect(response2.status).toEqual(200);
      expect(response1.headers.etag).toBe(response2.headers.etag);
    });

    it('sets proper Last-Modified header', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);
      globalMockEngine.getAttachmentBuffer.mockResolvedValue(
        mockAttachment.binaryImage,
      );

      const response = await request(app).get('/attachments/test-uuid-123');

      expect(response.status).toEqual(200);
      expect(response.headers['last-modified']).toBe(
        mockAttachment.created.toUTCString(),
      );
    });

    it('sets immutable cache directive for long-term caching', async () => {
      qetaStore.getAttachment.mockResolvedValue(mockAttachment);
      globalMockEngine.getAttachmentBuffer.mockResolvedValue(
        mockAttachment.binaryImage,
      );

      const response = await request(app).get('/attachments/test-uuid-123');

      expect(response.status).toEqual(200);
      expect(response.headers['cache-control']).toContain('immutable');
      expect(response.headers['cache-control']).toContain('max-age=31536000');
    });
  });
});
