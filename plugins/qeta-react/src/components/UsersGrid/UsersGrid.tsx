import { useEffect, useState } from 'react';
import { useGridPageSize, useQetaApi } from '../../hooks';

import { UsersGridContent } from './UsersGridContent';
import useDebounce from 'react-use/lib/useDebounce';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { QetaGridHeader } from '../Utility/QetaGridHeader';

import { Change, FilterPanel, UserFilters } from '../FilterPanel/FilterPanel';
import { Button, Collapse } from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-users-filters-expanded';

export const UsersGrid = () => {
  const [page, setPage] = useState(1);
  const entitiesPerPage = useGridPageSize('users', 24);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = useState<UserFilters>({
    order: 'desc',
    orderBy: 'totalPosts',
    searchQuery: '',
  });
  const [users, setUsers] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const onFilterChange = (
    changes: Change<UserFilters> | Change<UserFilters>[],
  ) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setUsers([]);
    setFilters(prev => {
      const newValue = { ...prev };
      for (const { key, value } of changesArray) {
        (newValue as any)[key] = value;
      }
      return newValue;
    });
  };
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
        setPage(1);
        setUsers([]);
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    if (response) {
      if (page === 1) {
        setUsers(response.users);
      } else {
        setUsers(prev => [...prev, ...response.users]);
      }
      setHasMore(response.users.length >= entitiesPerPage);
      setTotal(response.total);
    }
  }, [response, entitiesPerPage, page]);

  const combinedResponse = response
    ? {
        ...response,
        users: page === 1 && !loading ? response.users : users,
        total,
      }
    : undefined;

  return (
    <>
      <QetaGridHeader
        title={response ? t('usersPage.users', { count: response.total }) : ''}
        searchBarLabel={t('usersPage.search.label')}
        loading={loading}
        onSearch={setSearchQuery}
        buttons={
          <Button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            startIcon={<FilterList />}
          >
            {t('filterPanel.filterButton')}
          </Button>
        }
      />
      <Collapse in={showFilterPanel}>
        <FilterPanel<UserFilters>
          onChange={onFilterChange}
          filters={filters}
          mode="users"
        />
      </Collapse>
      <UsersGridContent
        response={combinedResponse}
        loading={loading}
        error={error}
        hasMore={hasMore}
        loadNextPage={() => setPage(prev => prev + 1)}
      />
    </>
  );
};
