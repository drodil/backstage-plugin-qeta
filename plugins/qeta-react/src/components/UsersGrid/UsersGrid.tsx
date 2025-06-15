import { useEffect, useState } from 'react';
import { useQetaApi } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { UsersGridContent } from './UsersGridContent';
import useDebounce from 'react-use/lib/useDebounce';
import { SearchBar } from '../SearchBar/SearchBar';
import { Grid, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

type EntityFilters = {
  order: 'asc' | 'desc';
  orderBy?: 'userRef';
  searchQuery: string;
};

export const UsersGrid = () => {
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
      api.getUsers({
        limit: entitiesPerPage,
        offset: (page - 1) * entitiesPerPage,
        ...filters,
      }),
    [entitiesPerPage, page, filters],
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
      setPageCount(Math.ceil(response.total / entitiesPerPage));
    }
  }, [response, entitiesPerPage]);

  return (
    <>
      <Grid container className="qetaUsersContainer">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={setSearchQuery}
            label={t('usersPage.search.label')}
            loading={loading}
          />
        </Grid>
      </Grid>
      <Grid container>
        {response && (
          <Grid item xs={12}>
            <Typography variant="h6" className="qetaUsersContainerTitle">
              {t('usersPage.users', { count: response.total })}
            </Typography>
          </Grid>
        )}
        <UsersGridContent response={response} loading={loading} error={error} />
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
    </>
  );
};
