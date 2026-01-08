import { useAnalytics } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from 'react-use/lib/useDebounce';
import { useQetaApi } from './useQetaApi';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';
import { filterKeys as globalFilterKeys } from '../components/FilterPanel/FilterPanel';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';

export type QetaEntitiesProps<T, F> = {
  fetch: (
    api: QetaApi,
    limit: number,
    offset: number,
    filters: F,
  ) => Promise<{ items: T[]; total: number }>;
  initialFilters: F;
  prefix: string;
  defaultPageSize?: number;
  filterKeys?: string[];
  fetchDeps?: any[];
  getKey?: (item: T) => string | number;
};

export type FilterChange<F> = {
  key: keyof F;
  value?: F[keyof F] | string | string[];
};

export function useQetaEntities<T, F>(props: QetaEntitiesProps<T, F>) {
  const {
    fetch,
    initialFilters,
    prefix,
    defaultPageSize,
    filterKeys,
    fetchDeps,
    getKey,
  } = props;
  const analytics = useAnalytics();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 24);
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(`qeta-${prefix}-filters-expanded`) === 'true',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<F>(initialFilters);

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      `qeta-${prefix}-filters-expanded`,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel, prefix]);

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

  const onFilterChange = (changes: FilterChange<F> | FilterChange<F>[]) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setItems([]);
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
        const allowedKeys = filterKeys ?? globalFilterKeys;
        if (!allowedKeys.includes(key as any)) {
          continue;
        }
        if (!value || value === 'false') {
          newValue.delete(key as string);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            newValue.delete(key as string);
          } else {
            newValue.set(key as string, value.join(','));
          }
        } else if (typeof value === 'number') {
          newValue.set(key as string, String(value));
        } else if ((value as any).length > 0) {
          newValue.set(key as string, value as any);
        } else {
          newValue.delete(key as string);
        }
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (query: string) => {
    onPageChange(1);
    setItems([]);
    if (query) {
      analytics.captureEvent(`qeta_search_${prefix}`, query);
    }
    setSearchQuery(query);
  };

  useDebounce(
    () => {
      if ((filters as any).searchQuery !== searchQuery) {
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
            setItems([]);
          }
        } else if (key === `${prefix}PerPage`) {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setPageSize(qpp);
        } else if ((filterKeys ?? globalFilterKeys).includes(key as any)) {
          filtersApplied = true;
          if (key === 'tags') {
            (filters as any).tags = filterTags(value.split(',')) ?? [];
          } else if (key === 'entities') {
            (filters as any).entities = value.split(',');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filterKeys, prefix]);

  const {
    value: response,
    loading,
    error,
    retry,
  } = useQetaApi(
    api => {
      return fetch(api, pageSize, (page - 1) * pageSize, filters);
    },
    [page, filters, pageSize, ...(fetchDeps ?? [])],
  );

  useEffect(() => {
    if (response) {
      if (page === 1) {
        setItems(response.items);
      } else {
        setItems(prev => {
          const newItems = response.items.filter(
            newItem =>
              !prev.some(prevItem => {
                if (getKey) {
                  return getKey(prevItem) === getKey(newItem);
                }
                return (prevItem as any).id === (newItem as any).id;
              }),
          );
          return [...prev, ...newItems];
        });
      }
      setHasMore((response.items ?? []).length >= pageSize);
      setTotal(response.total);
    }
  }, [response, page, pageSize, getKey]);

  const onPageSizeChange = (value: number) => {
    if (response) {
      let newPage = page;
      while (newPage * value > response.total) {
        newPage -= 1;
      }
      onPageChange(Math.max(1, newPage));
    }
    setPageSize(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set(`${prefix}PerPage`, String(value));
      return newValue;
    });
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
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
    items: page === 1 && !loading && response ? response.items : items,
    hasMore,
    total,
    loading,
    error,
    loadNextPage,
    retry,
    fetchNextPage: loadNextPage,
  };
}
