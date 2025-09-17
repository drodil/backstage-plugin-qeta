import { Filters, PostFilters } from '../components/FilterPanel/FilterPanel';
import {
  FiltersWithDateRange,
  formatDate,
  formatEntityName,
  getEntityTitle,
  getFiltersWithDateRange,
  imageUpload,
} from './utils';
import { Entity } from '@backstage/catalog-model';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';
import { ErrorApi } from '@backstage/core-plugin-api';

describe('formatDate', () => {
  it('should format the date to YYYY-MM-DD format', () => {
    const date = new Date(2024, 4, 30); // Month is zero index
    expect(formatDate(date)).toBe('2024-05-30');
  });
});

describe('getFiltersWithDateRange', () => {
  const filters: PostFilters = {
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    entity: '',
    tags: [],
    dateRange: '7-days',
  };
  const CurrentDate = Date;
  beforeEach(() => {
    const mockDate = new Date(1717047504106);
    jest.spyOn(global, 'Date').mockImplementation(date => {
      return date ? new CurrentDate(date) : mockDate;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should add 7-days date range filter to filters', () => {
    filters.dateRange = '7-days';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-24',
      toDate: '2024-05-30',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add 30-days date range filter to filters', () => {
    filters.dateRange = '30-days';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-01',
      toDate: '2024-05-30',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add custom date range filter to filters', () => {
    filters.dateRange = '2024-05-01--2024-05-25';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-01',
      toDate: '2024-05-25',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add not date range filter to filters', () => {
    filters.dateRange = '';
    const expectedVal: Filters = {
      ...filters,
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
});

describe('imageUpload', () => {
  it('should upload an image and return the location URI', async () => {
    const mockQetaApi: QetaApi = {
      postAttachment: jest.fn().mockResolvedValue({
        id: 1,
        locationUri: 'http://example.com/image.png',
      }),
    } as any;
    const mockErrorApi: ErrorApi = {
      post: jest.fn(),
    } as any;
    const onImageUpload = jest.fn();
    const upload = imageUpload({
      qetaApi: mockQetaApi,
      errorApi: mockErrorApi,
      onImageUpload,
    });

    const data = new ArrayBuffer(8);
    const result = await upload(data).next();

    expect(result.value).toBe('http://example.com/image.png');
    expect(onImageUpload).toHaveBeenCalledWith(1);
  });

  it('should handle upload errors', async () => {
    const mockQetaApi: QetaApi = {
      postAttachment: jest
        .fn()
        .mockResolvedValue({ errors: [{ message: 'Upload failed' }] }),
    } as any;
    const mockErrorApi: ErrorApi = {
      post: jest.fn(),
    } as any;
    const onImageUpload = jest.fn();
    const upload = imageUpload({
      qetaApi: mockQetaApi,
      errorApi: mockErrorApi,
      onImageUpload,
    });

    const data = new ArrayBuffer(8);
    const result = await upload(data).next();

    expect(result.value).toBe(false);
    expect(mockErrorApi.post).toHaveBeenCalledWith({
      name: 'Upload failed',
      message: 'Upload failed',
    });
  });
});

describe('formatEntityName', () => {
  it('should format the entity name correctly', () => {
    expect(formatEntityName('user:default/john_doe')).toBe('John Doe');
    expect(formatEntityName('user:default/jane-doe')).toBe('Jane Doe');
    expect(formatEntityName('user:default/jane.doe')).toBe('Jane Doe');
  });

  it('should return an empty string if username is not provided', () => {
    expect(formatEntityName()).toBe('');
  });
});

describe('getEntityTitle', () => {
  it('should return the entity title if available', () => {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: { name: 'test', title: 'Test Entity' },
    };
    expect(getEntityTitle(entity)).toBe('Test Entity');
  });

  it('should return the entity type if available', () => {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: { name: 'test', title: 'Test Entity' },
      spec: { type: 'test' },
    };
    expect(getEntityTitle(entity)).toBe('Test Entity (test)');
  });

  it('should return the stringified entity reference if title is not available', () => {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: { name: 'test' },
    };
    expect(getEntityTitle(entity)).toBe('Test');
  });
});
