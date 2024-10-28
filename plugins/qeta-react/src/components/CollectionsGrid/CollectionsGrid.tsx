import React, { useEffect } from 'react';
import { Grid, IconButton, TextField } from '@material-ui/core';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { NoCollectionsCard } from './NoCollectionsCard';

export type CollectionsGridProps = {
  owner?: string;
};

type CollectionFilters = {
  order: 'asc' | 'desc';
  orderBy?: 'created' | 'owner';
  searchQuery: string;
  owner?: string;
};

export const CollectionsGrid = (props: CollectionsGridProps) => {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [collectionsPerPage, setCollectionsPerPage] = React.useState(25);
  const [filters, setFilters] = React.useState<CollectionFilters>({
    order: 'desc',
    searchQuery: '',
    owner: props.owner,
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
        ...filters,
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

  if (!response?.collections || response.collections.length === 0) {
    return <NoCollectionsCard />;
  }

  return (
    <Grid container>
      <Grid item xs={12}>
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

      <CollectionsGridContent
        loading={loading}
        error={error}
        response={response}
      />
      <QetaPagination
        pageSize={collectionsPerPage}
        handlePageChange={(_e, p) => setPage(p)}
        handlePageSizeChange={e =>
          setCollectionsPerPage(Number(e.target.value))
        }
        page={page}
        pageCount={pageCount}
      />
    </Grid>
  );
};
