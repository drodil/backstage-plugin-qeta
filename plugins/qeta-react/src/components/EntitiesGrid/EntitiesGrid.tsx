import { Box } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useGridPageSize, useQetaApi } from '../../hooks';
import useDebounce from 'react-use/lib/useDebounce';

import { EntitiesGridContent } from './EntitiesGridContent';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { QetaGridHeader } from '../Utility/QetaGridHeader';

import { Change, EntityFilters, FilterPanel } from '../FilterPanel/FilterPanel';
import { Collapse, Button } from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-entities-filters-expanded';

export const EntitiesGrid = () => {
  const [page, setPage] = useState(1);
  const entitiesPerPage = useGridPageSize('entities', 24);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = useState<EntityFilters>({
    order: 'desc',
    orderBy: 'postsCount',
    searchQuery: '',
  });
  const [entities, setEntities] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const onFilterChange = (
    changes: Change<EntityFilters> | Change<EntityFilters>[],
  ) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setEntities([]);
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
      api.getEntities({
        limit: entitiesPerPage,
        offset: (page - 1) * entitiesPerPage,
        ...filters,
      }),
    [entitiesPerPage, page, filters],
  );

  const onSearchQueryChange = (val: string) => {
    setPage(1);
    setEntities([]);
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
      if (page === 1) {
        setEntities(response.entities);
      } else {
        setEntities(prev => [...prev, ...response.entities]);
      }
      setHasMore(response.entities.length >= entitiesPerPage);
      setTotal(response.total);
    }
  }, [response, entitiesPerPage, page]);

  const combinedResponse = response
    ? { ...response, entities, total }
    : undefined;

  return (
    <Box>
      <QetaGridHeader
        title={
          response ? t('common.entities', { count: response?.total ?? 0 }) : ''
        }
        searchBarLabel={t('entitiesPage.search.label')}
        loading={loading}
        onSearch={onSearchQueryChange}
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
        <FilterPanel<EntityFilters>
          onChange={onFilterChange}
          filters={filters}
          mode="entities"
        />
      </Collapse>
      <EntitiesGridContent
        response={combinedResponse}
        loading={loading}
        error={error}
        hasMore={hasMore}
        loadNextPage={() => setPage(prev => prev + 1)}
      />
    </Box>
  );
};
