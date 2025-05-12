import { Box, Grid, Typography } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { EntitiesGridContent } from './EntitiesGridContent';
import { SearchBar } from '../SearchBar/SearchBar';

type EntityFilters = {
  order: 'asc' | 'desc';
  orderBy?: 'entityRef';
  searchQuery: string;
};

export const EntitiesGrid = () => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [entitiesPerPage, setEntitiesPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EntityFilters>({
    order: 'desc',
    searchQuery: '',
  });
  const { t } = useTranslation();

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getEntities({
        limit: entitiesPerPage,
        offset: (page - 1) * entitiesPerPage,
        ...filters,
      }),
    [entitiesPerPage, page, filters],
  );

  const onSearchQueryChange = (val: string) => {
    setPage(1);
    setSearchQuery(val);
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
    if (response) {
      setPageCount(Math.ceil(response.total / entitiesPerPage));
    }
  }, [response, entitiesPerPage]);

  return (
    <Box>
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearchQueryChange}
            label={t('entitiesPage.search.label')}
            loading={loading}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between">
        {response && (
          <Grid item>
            <Typography variant="h6" className="qetaCollectionsContainerdCount">
              {t('common.entities', { count: response?.total ?? 0 })}
            </Typography>
          </Grid>
        )}
      </Grid>
      <EntitiesGridContent
        response={response}
        loading={loading}
        error={error}
      />
      {response && response?.total > 0 && (
        <QetaPagination
          pageSize={entitiesPerPage}
          handlePageChange={(_e, p) => setPage(p)}
          handlePageSizeChange={e => setEntitiesPerPage(Number(e.target.value))}
          page={page}
          pageCount={pageCount}
        />
      )}
    </Box>
  );
};
