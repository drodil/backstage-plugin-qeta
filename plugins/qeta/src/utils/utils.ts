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

export const truncate = (str: string, n: number): string => {
  return str.length > n ? `${str.slice(0, n - 1)}...` : str;
};

// Covers many common but not all cases of markdown formatting
export const removeMarkdownFormatting = (text: string): string => {
  // Remove horizontal rules
  let fixed = text.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*/gm, '');

  // Remove HTML tags
  fixed = text.replace(/<[^>]*>/g, '');

  // Handle code blocks defined with a language
  fixed = fixed.replace(/```[\s\S]*?```/g, match => {
    return match.replace(/(^```[a-z]*\n)|(```$)/g, '').trim();
  });

  // Handle inline code blocks and code blocks defined using ```
  fixed = fixed.replace(/`{1,2}([^`]*)`{1,2}/g, '$1');

  // Remove other markdown formatting
  fixed = fixed
    .replace(/(?:\*\*|__)([^\n*]+)(?:\*\*|__)/g, '$1') // Bold
    .replace(/(?:\*|_)([^\n*]+)(?:\*|_)/g, '$1') // Italic
    .replace(/(?:~~)([^~]+)(?:~~)/g, '$1') // Strikethrough
    .replace(/^[>\t]{0,3}>+\s?/gm, '') // Blockquotes
    .replace(/\[\^.+?\](: .*?$)?/g, '') // Footnotes
    .replace(/^([ \t]*)([*\-+]|\d+\.)\s+/gm, '') // Lists
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
    .replace(/^#{1,6}[ \t]+/gm, '') // Headers
    .replace(/^[=-]{2,}\s*$/g, '') // Setex style headers
    .replace(/(?:\r\n|\r|\n)/g, ' ') // Newlines
    .replace(/(^\s+|\s+$)/g, ''); // Trimming leading and trailing spaces

  // Remove remaining HTML tags
  fixed = fixed.replace(/<[^>]*>/g, '');

  return fixed;
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
