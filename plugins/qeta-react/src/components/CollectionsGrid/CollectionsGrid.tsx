import { useState, useEffect } from 'react';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import {
  CollectionFilters,
  CommonFilterPanelProps,
  FilterKey,
  filterKeys,
  FilterPanel,
} from '../FilterPanel/FilterPanel';
import FilterList from '@material-ui/icons/FilterList';
import { getFiltersWithDateRange } from '../../utils';
import { SearchBar } from '../SearchBar/SearchBar';
import { useSearchParams } from 'react-router-dom';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';

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
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsPerPage, setCollectionsPerPage] = useState(25);
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = useState<CollectionFilters>({
    order: 'desc',
    searchQuery: '',
    orderBy: 'created',
  });

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
        owner,
        ...(getFiltersWithDateRange(filters) as any),
      });
    },
    [collectionsPerPage, page, filters],
  );

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
    if (response) {
      setPageCount(Math.ceil(response.total / collectionsPerPage));
    }
  }, [response, collectionsPerPage]);

  const onFilterChange = (
    changes: CollectionFilterChange | CollectionFilterChange[],
  ) => {
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
        } else if (key === 'collectionsPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setCollectionsPerPage(qpp);
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
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={setSearchQuery}
            label={t('collectionsPage.search.label')}
            loading={loading}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between">
        {response && (
          <Grid item>
            <Typography variant="h6" className="qetaCollectionsContainerdCount">
              {t('common.collections', { count: response?.total ?? 0 })}
            </Typography>
          </Grid>
        )}
        {response && (showFilters ?? true) && (
          <Grid item>
            <Button
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
              }}
              className="qetaCollectionsContainerFilterPanelBtn"
              startIcon={<FilterList />}
            >
              {t('filterPanel.filterButton')}
            </Button>
          </Grid>
        )}
      </Grid>
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<CollectionFilters>
            onChange={onFilterChange}
            filters={filters}
            {...props.filterPanelProps}
          />
        </Collapse>
      )}
      <CollectionsGridContent
        loading={loading}
        error={error}
        response={response}
      />
      {response && response?.total > 0 && (
        <QetaPagination
          pageSize={collectionsPerPage}
          handlePageChange={(_e, p) => setPage(p)}
          handlePageSizeChange={e =>
            setCollectionsPerPage(Number(e.target.value))
          }
          page={page}
          pageCount={pageCount}
        />
      )}
    </Box>
  );
};
