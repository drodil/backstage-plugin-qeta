import { useQetaApi, useTranslation } from '../../utils/hooks';
import {
  Box,
  Button,
  Collapse,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';

import React, { useEffect } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import FilterList from '@material-ui/icons/FilterList';
import { useSearchParams } from 'react-router-dom';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useAnalytics } from '@backstage/core-plugin-api';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { getFiltersWithDateRange } from '../../utils/utils';
import {
  FilterKey,
  filterKeys,
  FilterPanel,
  Filters,
} from '../QuestionsContainer/FilterPanel';
import { AnswerList } from './AnswerList';

export interface AnswersContainerProps {
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
}

export const AnswersContainer = (props: AnswersContainerProps) => {
  const { tags, author, entity, showFilters, showTitle, title } = props;
  const analytics = useAnalytics();
  const [page, setPage] = React.useState(1);
  const [answersPerPage, setAnswersPerPage] = React.useState(10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    order: 'desc',
    orderBy: 'created',
    searchQuery: '',
    dateRange: '',
    noCorrectAnswer: 'false',
    entity: entity ?? '',
    tags: tags ?? [],
    noVotes: 'false',
  });
  const { t } = useTranslation();

  const onPageChange = (value: number) => {
    setPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('page', String(value));
      return newValue;
    });
  };

  const onFilterChange = (key: FilterKey, value: string | string[]) => {
    if (filters[key] === value) {
      return;
    }

    setPage(1);
    setFilters({ ...filters, ...{ [key]: value } });
    setSearchParams(prev => {
      const newValue = prev;
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
      return newValue;
    });
  };

  const onSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(1);
    if (event.target.value) {
      analytics.captureEvent('qeta_search', event.target.value);
    }
    setSearchQuery(event.target.value);
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
        ...getFiltersWithDateRange(filters),
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
          style={{ marginBottom: '1.5rem' }}
        >
          {shownTitle} {link}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            id="search-bar"
            fullWidth
            onChange={onSearchQueryChange}
            label={t('answerContainer.search.label')}
            className="qetaAnswersContainerSearchInput"
            variant="outlined"
            placeholder={t('answerContainer.search.placeholder')}
            size="small"
            style={{ marginBottom: '5px' }}
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
              onClick={() => setShowFilterPanel(!showFilterPanel)}
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
          <FilterPanel
            onChange={onFilterChange}
            filters={filters}
            answerFilters
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
