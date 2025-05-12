import { useAnalytics } from '@backstage/core-plugin-api';
import { useState, useEffect } from 'react';
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

export type PostFilterChange = {
  key: keyof PostFilters;
  value?: PostFilters[keyof PostFilters];
};

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-post-filters-expanded';

export function usePaginatedPosts(props: PaginatedPostsProps) {
  const { type, tags, author, entities, entity, favorite, initialPageSize } =
    props;
  const analytics = useAnalytics();
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(initialPageSize ?? 10);
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PostFilters>({
    order: props.order ?? 'desc',
    orderBy: props.orderBy ?? 'created',
    noAnswers: props.noAnswers ?? 'false',
    noCorrectAnswer: props.noCorrectAnswer ?? 'false',
    noVotes: props.noVotes ?? 'false',
    searchQuery: props.searchQuery ?? '',
    entities: entities ?? (entity ? [entity] : undefined),
    tags: tags,
    dateRange: '',
    collectionId: props.collectionId,
    type,
  });

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

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

  const onFilterChange = (changes: PostFilterChange | PostFilterChange[]) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setFilters(prev => {
      const newValue = { ...prev };
      for (const { key, value } of changesArray) {
        (newValue as any)[key] = value;
      }
      return newValue;
    });
    setSearchParams(prev => {
      const newValue = prev;
      for (const { key, value } of changesArray) {
        if (!filterKeys.includes(key as FilterKey)) {
          continue;
        }
        if (!value || value === 'false') {
          newValue.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            newValue.delete(key);
          } else {
            newValue.set(key, value.join(','));
          }
        } else if (typeof value === 'number') {
          newValue.set(key, String(value));
        } else if (value.length > 0) {
          newValue.set(key, value);
        } else {
          newValue.delete(key);
        }
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (query: string) => {
    onPageChange(1);
    if (query) {
      analytics.captureEvent('qeta_search', query);
    }
    setSearchQuery(query);
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
            filters.tags = filterTags(value.split(',')) ?? [];
          } else if (key === 'entities') {
            filters.entities = value.split(',');
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
        includeAnswers: false,
        includeComments: false,
        includeAttachments: false,
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
