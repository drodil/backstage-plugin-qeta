import { Filters } from '../components/QuestionsContainer/FilterPanel';
import {
  FiltersWithDateRange,
  formatDate,
  getFiltersWithDateRange,
} from './utils';

describe('formatDate', () => {
  it('should format the date to YYYY-MM-DD format', () => {
    const date = new Date(2024, 4, 30); // Month is zero index
    expect(formatDate(date)).toBe('2024-05-30');
  });
});

describe('getFiltersWithDateRange', () => {
  const filters: Filters = {
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
