import React, { useEffect } from 'react';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { CollectionFilters, FilterPanel } from '../FilterPanel/FilterPanel';
import FilterList from '@mui/icons-material/FilterList';
import { getFiltersWithDateRange } from '../../utils';

export type CollectionsGridProps = {
  owner?: string;
  showFilters?: boolean;
};

export type CollectionFilterChange = {
  key: keyof CollectionFilters;
  value?: CollectionFilters[keyof CollectionFilters];
};

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-collection-filters-expanded';

export const CollectionsGrid = (props: CollectionsGridProps) => {
  const { showFilters } = props;
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [collectionsPerPage, setCollectionsPerPage] = React.useState(25);
  const [showFilterPanel, setShowFilterPanel] = React.useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = React.useState<CollectionFilters>({
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
  };

  return (
    <Box>
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            id="search-bar"
            className="text qetaUsersContainerSearchInput"
            onChange={(
              event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
            ) => setSearchQuery(event.target.value)}
            label={t('collectionsPage.search.label')}
            variant="outlined"
            placeholder={t('collectionsPage.search.placeholder')}
            size="small"
          />
          <IconButton type="submit" aria-label="search" size="large" />
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
