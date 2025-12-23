import { useEffect, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import { useSearchParams } from 'react-router-dom';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useAnalytics } from '@backstage/core-plugin-api';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { getFiltersWithDateRange } from '../../utils/utils';
import {
  AnswerFilters,
  FilterKey,
  filterKeys,
  FilterPanel,
} from '../FilterPanel/FilterPanel';
import { AnswerList } from './AnswerList';
import { useQetaApi } from '../../hooks';
import { SearchBar } from '../SearchBar/SearchBar';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export interface AnswersContainerProps {
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
}

export type AnswerFilterChange = {
  key: keyof AnswerFilters;
  value?: AnswerFilters[keyof AnswerFilters];
};

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-answer-filters-expanded';

export const AnswersContainer = (props: AnswersContainerProps) => {
  const { tags, author, entity, showFilters, showTitle, title } = props;
  const analytics = useAnalytics();
  const [page, setPage] = useState(1);
  const [answersPerPage, setAnswersPerPage] = useState(25);
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [answers, setAnswers] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AnswerFilters>({
    order: 'desc',
    orderBy: 'created',
    searchQuery: '',
    dateRange: '',
    entities: entity ? [entity] : undefined,
    tags: tags ?? [],
    noVotes: 'false',
  });
  const { t } = useTranslationRef(qetaTranslationRef);

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const onFilterChange = (
    changes: AnswerFilterChange | AnswerFilterChange[],
  ) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setAnswers([]);
    setFilters(prev => {
      const newValue = { ...prev };
      for (const { key, value } of changesArray) {
        (newValue as any)[key] = value;
      }
      return newValue;
    });
    setSearchParams(prev => {
      const newValue = prev;
      for (const { key, value } of changesArray) {
        if (!value || value === 'false') {
          newValue.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            newValue.delete(key);
          } else {
            newValue.set(key, value.join(','));
          }
        } else if (value.length > 0) {
          newValue.set(key, value);
        } else {
          newValue.delete(key);
        }
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (query: string) => {
    setPage(1);
    setAnswers([]);
    if (query) {
      analytics.captureEvent('qeta_search', query);
    }
    setSearchQuery(query);
  };

  useDebounce(
    () => {
      if (filters.searchQuery !== searchQuery) {
        setPage(1);
        setAnswers([]);
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    let filtersApplied = false;
    searchParams.forEach((value, key) => {
      try {
        if (key === 'page') {
          const pv = Number.parseInt(value, 10);
          if (pv > 0) {
            setPage(pv);
          } else {
            setPage(1);
            setAnswers([]);
          }
        } else if (key === 'answersPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setAnswersPerPage(qpp);
        } else if (filterKeys.includes(key as FilterKey)) {
          filtersApplied = true;
          if (key === 'tags') {
            filters.tags = filterTags(value.split(',')) ?? [];
          } else if (key === 'entities') {
            filters.entities = value.split(',');
          } else {
            (filters as any)[key] = value;
          }
        }
      } catch (_e) {
        // NOOP
      }
    });
    setFilters(filters);
    if (filtersApplied) {
      setShowFilterPanel(true);
    }
  }, [searchParams, filters]);

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => {
      return api.getAnswers({
        limit: answersPerPage,
        offset: (page - 1) * answersPerPage,
        author,
        ...(getFiltersWithDateRange(filters) as any),
      });
    },
    [page, filters, answersPerPage],
  );

  useEffect(() => {
    if (response) {
      if (page === 1) {
        setAnswers(response.answers);
      } else {
        setAnswers(prev => [...prev, ...response.answers]);
      }
      setHasMore(response.answers.length >= answersPerPage);
      setTotal(response.total);
    }
  }, [response, page, answersPerPage]);

  const combinedResponse = response
    ? { ...response, answers, total }
    : undefined;

  let shownTitle = title;
  let link = undefined;
  if (author) {
    shownTitle = `${t('answerContainer.title.answersBy')} `;
    link = <EntityRefLink entityRef={author} hideIcon defaultKind="user" />;
  } else if (entity) {
    shownTitle = `${t('answerContainer.title.answersAbout')} `;
    link = <EntityRefLink entityRef={entity} />;
  } else if (tags) {
    shownTitle = t('answerContainer.title.answersTagged', {
      tags: tags.join(', '),
    });
  }

  return (
    <Box className="qetaAnswersContainer">
      {showTitle && (
        <Box mb={3}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography
                variant="h5"
                className="qetaAnswersContainerTitle"
                style={{ fontWeight: 500, paddingBottom: 2 }}
              >
                {shownTitle} {link}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      <Grid container alignItems="flex-end" justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearchQueryChange}
            label={t('answerContainer.search.label')}
            loading={loading}
          />
        </Grid>
      </Grid>
      {response && (
        <Box mt={2} mb={2}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography
                variant="h6"
                className="qetaAnswersContainerAnswerCount"
                style={{ fontWeight: 500, paddingBottom: 2 }}
              >
                {t('common.answersCount', { count: response?.total ?? 0 })}
              </Typography>
            </Grid>
            {(showFilters ?? true) && (
              <Grid item>
                <Button
                  onClick={() => {
                    setShowFilterPanel(!showFilterPanel);
                  }}
                  className="qetaAnswerContainerFilterPanelBtn"
                  startIcon={<FilterList />}
                >
                  {t('filterPanel.filterButton')}
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<AnswerFilters>
            onChange={onFilterChange}
            filters={filters}
          />
        </Collapse>
      )}

      <AnswerList
        loading={loading}
        error={error}
        response={combinedResponse}
        entity={entity}
        entityPage={entity !== undefined}
        tags={tags}
        hasMore={hasMore}
        loadNextPage={() => setPage(prev => prev + 1)}
      />
    </Box>
  );
};
