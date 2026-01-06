import { useEffect, useState } from 'react';
import { Box, Button, Collapse } from '@material-ui/core';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useGridPageSize, useQetaApi } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';

import {
  CollectionFilters,
  CommonFilterPanelProps,
  FilterKey,
  filterKeys,
  FilterPanel,
} from '../FilterPanel/FilterPanel';
import FilterList from '@material-ui/icons/FilterList';
import { getFiltersWithDateRange } from '../../utils';
import { useSearchParams } from 'react-router-dom';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { QetaGridHeader } from '../Utility/QetaGridHeader';

export type CollectionsGridProps = {
  owner?: string;
  showFilters?: boolean;
  filterPanelProps?: CommonFilterPanelProps;
};

export type CollectionFilterChange = {
  key: keyof CollectionFilters;
  value?: CollectionFilters[keyof CollectionFilters];
};

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-collection-filters-expanded';

export const CollectionsGrid = (props: CollectionsGridProps) => {
  const { showFilters, owner } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const [page, setPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const collectionsPerPage = useGridPageSize('collections', 24);
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [filters, setFilters] = useState<CollectionFilters>({
    order: 'desc',
    searchQuery: '',
    orderBy: 'created',
  });
  const [collections, setCollections] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => {
      return api.getCollections({
        limit: collectionsPerPage,
        offset: (page - 1) * collectionsPerPage,
        includePosts: false,
        includeExperts: false,
        owner,
        ...(getFiltersWithDateRange(filters) as any),
      });
    },
    [collectionsPerPage, page, filters],
  );

  useDebounce(
    () => {
      if (filters.searchQuery !== searchQuery) {
        setPage(1);
        setCollections([]);
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    if (response) {
      if (page === 1) {
        setCollections(response.collections);
      } else {
        setCollections(prev => [...prev, ...response.collections]);
      }
      setHasMore(response.collections.length >= collectionsPerPage);
      setTotal(response.total);
    }
  }, [response, collectionsPerPage, page]);

  const combinedResponse = response
    ? {
        ...response,
        collections:
          page === 1 && !loading ? response.collections : collections,
        total,
      }
    : undefined;

  const onFilterChange = (
    changes: CollectionFilterChange | CollectionFilterChange[],
  ) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setCollections([]);
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
            setCollections([]);
          }
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

  return (
    <Box>
      <QetaGridHeader
        title={t('common.collections', { count: response?.total ?? 0 })}
        searchBarLabel={t('collectionsPage.search.label')}
        loading={loading}
        onSearch={setSearchQuery}
        buttons={
          response &&
          (showFilters ?? true) && (
            <Button
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
              }}
              className="qetaCollectionsContainerFilterPanelBtn"
              startIcon={<FilterList />}
            >
              {t('filterPanel.filterButton')}
            </Button>
          )
        }
      />
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<CollectionFilters>
            onChange={onFilterChange}
            filters={filters}
            mode="collections"
            {...props.filterPanelProps}
          />
        </Collapse>
      )}
      <CollectionsGridContent
        loading={loading}
        error={error}
        response={combinedResponse}
        hasMore={hasMore}
        loadNextPage={() => setPage(prev => prev + 1)}
      />
    </Box>
  );
};
