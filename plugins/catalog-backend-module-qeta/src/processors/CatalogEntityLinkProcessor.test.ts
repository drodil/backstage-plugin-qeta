import { mockServices } from '@backstage/backend-test-utils';
import { CatalogEntityLinkProcessor } from './CatalogEntityLinkProcessor';
import { Entity } from '@backstage/catalog-model';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

// Mock the QetaClient
jest.mock('@drodil/backstage-plugin-qeta-common', () => ({
  QetaClient: jest.fn(),
}));

describe('CatalogEntityLinkProcessor', () => {
  const mockCache = mockServices.cache.mock();
  const mockAuth = mockServices.auth();
  const mockLogger = mockServices.logger.mock();
  const mockDiscovery = mockServices.discovery();

  let processor: CatalogEntityLinkProcessor;
  let mockQetaClient: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock QetaClient instance
    mockQetaClient = {
      getEntityLinks: jest.fn(),
    };
    (QetaClient as jest.Mock).mockImplementation(() => mockQetaClient);

    processor = new CatalogEntityLinkProcessor(
      mockAuth,
      mockCache,
      mockLogger,
      mockDiscovery,
    );
  });

  describe('constructor', () => {
    it('should create a QetaClient with discovery API', () => {
      expect(QetaClient).toHaveBeenCalledWith({
        discoveryApi: mockDiscovery,
      });
    });
  });

  describe('getProcessorName', () => {
    it('should return the correct processor name', () => {
      expect(processor.getProcessorName()).toBe('CatalogEntityLinkProcessor');
    });
  });

  describe('postProcessEntity', () => {
    const mockEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-component',
        namespace: 'default',
      },
      spec: {},
    };

    it('should return entity unchanged when no entity links exist', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue([]);

      const result = await processor.postProcessEntity(mockEntity);

      expect(result).toEqual(mockEntity);
    });

    it('should return entity unchanged when no matching entity links exist', async () => {
      const entityLinks = [
        {
          entityRef: 'component:default/other-component',
          links: [{ url: 'https://example.com', title: 'Example' }],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity(mockEntity);

      expect(result).toEqual(mockEntity);
    });

    it('should add new links when matching entity links exist', async () => {
      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [
            { url: 'https://example.com', title: 'Example' },
            { url: 'https://docs.example.com', title: 'Documentation' },
          ],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity(mockEntity);

      expect(result.metadata.links).toEqual([
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://docs.example.com', title: 'Documentation' },
      ]);
    });

    it('should merge new links with existing links without duplicates', async () => {
      const entityWithLinks: Entity = {
        ...mockEntity,
        metadata: {
          ...mockEntity.metadata,
          links: [
            { url: 'https://existing.com', title: 'Existing' },
            { url: 'https://example.com', title: 'Example' },
          ],
        },
      };

      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [
            { url: 'https://example.com', title: 'Example' }, // duplicate
            { url: 'https://new.com', title: 'New Link' },
          ],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity(entityWithLinks);

      expect(result.metadata.links).toEqual([
        { url: 'https://existing.com', title: 'Existing' },
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://new.com', title: 'New Link' },
      ]);
    });

    it('should handle multiple entity link entries for the same entity', async () => {
      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://example1.com', title: 'Example 1' }],
        },
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://example2.com', title: 'Example 2' }],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity(mockEntity);

      expect(result.metadata.links).toEqual([
        { url: 'https://example1.com', title: 'Example 1' },
        { url: 'https://example2.com', title: 'Example 2' },
      ]);
    });
  });

  describe('getEntityLinks caching', () => {
    it('should use cached entity links when available', async () => {
      const cachedLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://cached.com', title: 'Cached' }],
        },
      ];

      mockCache.get.mockResolvedValue(JSON.stringify(cachedLinks));

      const result = await processor.postProcessEntity({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component', namespace: 'default' },
        spec: {},
      });

      expect(mockQetaClient.getEntityLinks).not.toHaveBeenCalled();
      expect(result.metadata.links).toEqual([
        { url: 'https://cached.com', title: 'Cached' },
      ]);
    });

    it('should fetch and cache entity links when cache is empty', async () => {
      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://fresh.com', title: 'Fresh' }],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      await processor.postProcessEntity({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component', namespace: 'default' },
        spec: {},
      });

      expect(mockQetaClient.getEntityLinks).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'qeta-entity-links',
        JSON.stringify(entityLinks),
        { ttl: 60 * 60 },
      );
    });

    it('should handle invalid cached data gracefully', async () => {
      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://fallback.com', title: 'Fallback' }],
        },
      ];

      mockCache.get.mockResolvedValue('invalid-json');
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component', namespace: 'default' },
        spec: {},
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse cached entity links:'),
      );
      expect(mockQetaClient.getEntityLinks).toHaveBeenCalled();
      expect(result.metadata.links).toEqual([
        { url: 'https://fallback.com', title: 'Fallback' },
      ]);
    });

    it('should handle QetaClient errors gracefully', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockRejectedValue(new Error('API failed'));

      const entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component', namespace: 'default' },
        spec: {},
      };

      await expect(processor.postProcessEntity(entity)).rejects.toThrow(
        'API failed',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle entity with empty metadata', async () => {
      const entityWithEmptyMetadata: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
        },
        spec: {},
      };

      const entityLinks = [
        {
          entityRef: 'component:default/test-component',
          links: [{ url: 'https://test.com', title: 'Test' }],
        },
      ];

      mockCache.get.mockResolvedValue(undefined);
      mockQetaClient.getEntityLinks.mockResolvedValue(entityLinks);

      const result = await processor.postProcessEntity(entityWithEmptyMetadata);

      expect(result.metadata.links).toEqual([
        { url: 'https://test.com', title: 'Test' },
      ]);
    });
  });
});
