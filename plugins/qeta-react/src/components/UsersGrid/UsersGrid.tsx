import { useEffect, useState } from 'react';
import { useQetaApi } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
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
  const [pageCount, setPageCount] = useState(1);
  const [entitiesPerPage, setEntitiesPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = useState<UserFilters>({
    order: 'desc',
    orderBy: 'totalPosts',
    searchQuery: '',
  });

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
      <UsersGridContent response={response} loading={loading} error={error} />
      {response && response?.total > 0 && (
        <QetaPagination
          pageSize={entitiesPerPage}
          handlePageChange={(_e, p) => setPage(p)}
          handlePageSizeChange={e => setEntitiesPerPage(Number(e.target.value))}
          page={page}
          pageCount={pageCount}
        />
      )}
    </>
  );
};
