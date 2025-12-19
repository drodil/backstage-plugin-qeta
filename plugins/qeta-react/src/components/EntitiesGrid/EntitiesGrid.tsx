import { Box, Grid } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useQetaApi } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { EntitiesGridContent } from './EntitiesGridContent';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { QetaGridHeader } from '../Utility/QetaGridHeader';

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
  const { t } = useTranslationRef(qetaTranslationRef);

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
    300,
    [searchQuery],
  );

  useEffect(() => {
    if (response) {
      setPageCount(Math.ceil(response.total / entitiesPerPage));
    }
  }, [response, entitiesPerPage]);

  return (
    <Box>
      <QetaGridHeader
        title={
          response ? t('common.entities', { count: response?.total ?? 0 }) : ''
        }
        searchBarLabel={t('entitiesPage.search.label')}
        loading={loading}
        onSearch={onSearchQueryChange}
      />
      <Grid container justifyContent="center">
        <EntitiesGridContent
          response={response}
          loading={loading}
          error={error}
        />
        {response && response?.total > 0 && (
          <QetaPagination
            pageSize={entitiesPerPage}
            handlePageChange={(_e, p) => setPage(p)}
            handlePageSizeChange={e =>
              setEntitiesPerPage(Number(e.target.value))
            }
            page={page}
            pageCount={pageCount}
          />
        )}
      </Grid>
    </Box>
  );
};
