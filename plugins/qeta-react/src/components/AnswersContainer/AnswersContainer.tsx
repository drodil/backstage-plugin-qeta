import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import React, { useEffect } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import FilterList from '@mui/icons-material/FilterList';
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
import { useQetaApi, useTranslation } from '../../hooks';
import { SearchBar } from '../SearchBar/SearchBar';

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
  const [page, setPage] = React.useState(1);
  const [answersPerPage, setAnswersPerPage] = React.useState(10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<AnswerFilters>({
    order: 'desc',
    orderBy: 'created',
    searchQuery: '',
    dateRange: '',
    entities: entity ? [entity] : undefined,
    tags: tags ?? [],
    noVotes: 'false',
  });
  const { t } = useTranslation();

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const onPageChange = (value: number) => {
    setPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('page', String(value));
      return newValue;
    });
  };

  const onFilterChange = (
    changes: AnswerFilterChange | AnswerFilterChange[],
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
    onPageChange(1);
    if (query) {
      analytics.captureEvent('qeta_search', query);
    }
    setSearchQuery(query);
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
    let filtersApplied = false;
    searchParams.forEach((value, key) => {
      try {
        if (key === 'page') {
          const pv = Number.parseInt(value, 10);
          if (pv > 0) {
            setPage(pv);
          } else {
            setPage(1);
          }
        } else if (key === 'answersPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setAnswersPerPage(qpp);
        } else if (filterKeys.includes(key as FilterKey)) {
          filtersApplied = true;
          if (key === 'tags') {
            filters.tags = filterTags(value) ?? [];
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

  const onPageSizeChange = (value: number) => {
    if (response) {
      let newPage = page;
      while (newPage * value > response.total) {
        newPage -= 1;
      }
      onPageChange(Math.max(1, newPage));
    }
    setAnswersPerPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('answersPerPage', String(value));
      return newValue;
    });
  };

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
        <Typography
          variant="h5"
          className="qetaAnswersContainerTitle"
          style={{ marginBottom: '1.5em' }}
        >
          {shownTitle} {link}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearchQueryChange}
            label={t('answerContainer.search.label')}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h6" className="qetaAnswersContainerAnswerCount">
            {t('common.answers', { count: response?.total ?? 0 })}
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
        response={response}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        entity={entity}
        page={page}
        pageSize={answersPerPage}
        entityPage={entity !== undefined}
        tags={tags}
      />
    </Box>
  );
};
