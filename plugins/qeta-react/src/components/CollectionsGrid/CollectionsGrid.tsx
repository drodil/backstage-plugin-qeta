import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@material-ui/core';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { CollectionFilters, FilterPanel } from '../FilterPanel/FilterPanel';
import FilterList from '@material-ui/icons/FilterList';
import { getFiltersWithDateRange } from '../../utils';

export type CollectionsGridProps = {
  owner?: string;
  showFilters?: boolean;
};

export type CollectionFilterChange = {
  key: keyof CollectionFilters;
  value?: CollectionFilters[keyof CollectionFilters];
};

export const CollectionsGrid = (props: CollectionsGridProps) => {
  const { showFilters } = props;
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [collectionsPerPage, setCollectionsPerPage] = React.useState(25);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filters, setFilters] = React.useState<CollectionFilters>({
    order: 'desc',
    searchQuery: '',
    orderBy: 'created',
  });

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
          <IconButton type="submit" aria-label="search" />
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
              onClick={() => setShowFilterPanel(!showFilterPanel)}
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
