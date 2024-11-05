import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React, { useEffect } from 'react';
import { useQetaApi, useTranslation } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { EntitiesGridContent } from './EntitiesGridContent';

type EntityFilters = {
  order: 'asc' | 'desc';
  orderBy?: 'entityRef';
  searchQuery: string;
};

export const EntitiesGrid = () => {
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [entitiesPerPage, setEntitiesPerPage] = React.useState(25);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<EntityFilters>({
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
    <Grid container className="qetaEntitiesContainer">
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text qetaEntitiesContainerSearchInput"
          onChange={(
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => onSearchQueryChange(event.target.value)}
          label={t('entitiesPage.search.label')}
          variant="outlined"
          placeholder={t('entitiesPage.search.placeholder')}
          size="small"
        />
        <IconButton type="submit" aria-label="search" size="large" />
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
    </Grid>
  );
};
