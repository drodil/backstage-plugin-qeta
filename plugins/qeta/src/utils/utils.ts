import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Filters } from '../components/QuestionsContainer/FilterPanel';

export const formatEntityName = (username?: string) => {
  if (!username) {
    return '';
  }
  const plainName = username.split(/[/:]+/).pop();
  return plainName
    ?.split(/[_.-]+/)
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
    .join(' ');
};

export const getEntityTitle = (entity: Entity): string => {
  const stringified = stringifyEntityRef(entity);
  return formatEntityName(entity.metadata.title ?? stringified) ?? stringified;
};

export const formatDate = (localDate: Date) => {
  let date: any = localDate.getDate();
  let month: any = localDate.getMonth() + 1;
  if (date < 10) {
    date = `0${date}`;
  }

  if (month < 10) {
    month = `0${month}`;
  }
  return `${localDate.getFullYear()}-${month}-${date}`;
};

export type FiltersWithDateRange = Filters & {
  fromDate: string;
  toDate: string;
};

export const getFiltersWithDateRange = (filters: Filters) => {
  let filtersWithDateRange: FiltersWithDateRange;
  const to = new Date();
  const from = new Date(to);
  if (filters.dateRange) {
    let fromDate = '';
    let toDate = '';

    switch (filters.dateRange) {
      case '7-days':
        toDate = formatDate(to);
        from.setDate(to.getDate() - 6);
        fromDate = formatDate(from);
        break;

      case '30-days':
        toDate = formatDate(to);
        from.setDate(to.getDate() - 29);
        fromDate = formatDate(from);
        break;
      default:
        if (filters.dateRange.indexOf('--') > 0) {
          fromDate = filters.dateRange.split('--')[0];
          toDate = filters.dateRange.split('--')[1];
        }
        break;
    }
    if (fromDate && toDate) {
      filtersWithDateRange = { ...filters, fromDate, toDate };
      delete filtersWithDateRange.dateRange;
      return filtersWithDateRange;
    }
  }
  return filters;
};
