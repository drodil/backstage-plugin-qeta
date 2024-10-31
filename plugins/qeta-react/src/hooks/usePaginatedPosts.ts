import { useAnalytics } from '@backstage/core-plugin-api';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FilterKey,
  filterKeys,
  PostFilters,
} from '../components/FilterPanel/FilterPanel';
import useDebounce from 'react-use/lib/useDebounce';
import { getFiltersWithDateRange } from '../utils';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi } from './useQetaApi';

export type PaginatedPostsProps = PostFilters & {
  author?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  favorite?: boolean;
  showAskButton?: boolean;
  showWriteButton?: boolean;
  showNoQuestionsBtn?: boolean;
  initialPageSize?: number;
  collectionId?: number;
};

export function usePaginatedPosts(props: PaginatedPostsProps) {
  const { type, tags, author, entity, favorite, initialPageSize } = props;
  const analytics = useAnalytics();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [postsPerPage, setPostsPerPage] = React.useState(initialPageSize ?? 10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<PostFilters>({
    order: props.order ?? 'desc',
    orderBy: props.orderBy ?? 'created',
    noAnswers: props.noAnswers ?? 'false',
    noCorrectAnswer: props.noCorrectAnswer ?? 'false',
    noVotes: props.noVotes ?? 'false',
    searchQuery: props.searchQuery ?? '',
    entity: entity ?? '',
    tags: tags ?? [],
    dateRange: '',
    collectionId: props.collectionId,
    type,
  });

  const onPageChange = (value: number) => {
    setPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('page', String(value));
      return newValue;
    });
  };

  const loadNextPage = () => {
    setPage(prev => prev + 1);
  };

  const onFilterChange = (key: keyof PostFilters, value: string | string[]) => {
    if (filters[key] === value) {
      return;
    }

    setPage(1);
    setFilters({ ...filters, ...{ [key]: value } });
    setSearchParams(prev => {
      const newValue = prev;
      if (!value || value === 'false') {
        newValue.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          newValue.delete(key);
        } else {
          newValue.set(key, value.join(','));
        }
      } else if (value.length > 0) {
        newValue.set(key, value);
      } else {
        newValue.delete(key);
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(1);
    if (event.target.value) {
      analytics.captureEvent('qeta_search', event.target.value);
    }
    setSearchQuery(event.target.value);
  };

  useDebounce(
    () => {
      if (filters.searchQuery !== searchQuery) {
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    let filtersApplied = false;
    searchParams.forEach((value, key) => {
      try {
        if (key === 'page') {
          const pv = Number.parseInt(value, 10);
          if (pv > 0) {
            setPage(pv);
          } else {
            setPage(1);
          }
        } else if (key === 'postsPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setPostsPerPage(qpp);
        } else if (filterKeys.includes(key as FilterKey)) {
          filtersApplied = true;
          if (key === 'tags') {
            filters.tags = filterTags(value) ?? [];
          } else {
            (filters as any)[key] = value;
          }
        }
      } catch (_e) {
        // NOOP
      }
    });
    setFilters(filters);
    if (filtersApplied) {
      setShowFilterPanel(true);
    }
  }, [searchParams, filters]);

  const {
    value: response,
    loading,
    error,
    retry,
  } = useQetaApi(
    api => {
      return api.getPosts({
        type,
        limit: postsPerPage,
        offset: (page - 1) * postsPerPage,
        includeEntities: true,
        author,
        favorite,
        ...(getFiltersWithDateRange(filters) as any),
      });
    },
    [type, page, filters, postsPerPage],
  );

  useEffect(() => {
    if (response) {
      setPageCount(Math.ceil(response.total / postsPerPage));
    }
  }, [response, postsPerPage]);

  const onPageSizeChange = (value: number) => {
    if (response) {
      let newPage = page;
      while (newPage * value > response.total) {
        newPage -= 1;
      }
      onPageChange(Math.max(1, newPage));
    }
    setPostsPerPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('postsPerPage', String(value));
      return newValue;
    });
  };

  return {
    page,
    setPage,
    postsPerPage,
    setPostsPerPage,
    showFilterPanel,
    setShowFilterPanel,
    searchParams,
    setSearchParams,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    onPageChange,
    onPageSizeChange,
    onFilterChange,
    onSearchQueryChange,
    response,
    loading,
    error,
    loadNextPage,
    pageCount,
    retry,
  };
}
