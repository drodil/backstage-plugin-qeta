import { useQetaApi } from '../../utils/hooks';
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
import { FilterKey, filterKeys, FilterPanel, Filters } from './FilterPanel';
import { QuestionList } from './QuestionList';
import FilterList from '@material-ui/icons/FilterList';
import { useSearchParams } from 'react-router-dom';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useAnalytics } from '@backstage/core-plugin-api';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';

export interface QuestionsContainerProps {
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  favorite?: boolean;
  showAskButton?: boolean;
  showNoQuestionsBtn?: boolean;
}

export const QuestionsContainer = (props: QuestionsContainerProps) => {
  const {
    tags,
    author,
    entity,
    showFilters,
    showTitle,
    title,
    favorite,
    showAskButton,
    showNoQuestionsBtn,
  } = props;
  const analytics = useAnalytics();
  const [page, setPage] = React.useState(1);
  const [questionsPerPage, setQuestionsPerPage] = React.useState(10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    entity: entity ?? '',
    tags: tags ?? [],
  });

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
        } else if (key === 'questionsPerPage') {
          const qpp = Number.parseInt(value, 10);
          if (qpp > 0) setQuestionsPerPage(qpp);
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
      return api.getQuestions({
        limit: questionsPerPage,
        offset: (page - 1) * questionsPerPage,
        includeEntities: true,
        author,
        favorite,
        ...filters,
      });
    },
    [page, filters, questionsPerPage],
  );

  const onPageSizeChange = (value: number) => {
    if (response) {
      let newPage = page;
      while (newPage * value > response.total) {
        newPage -= 1;
      }
      onPageChange(Math.max(1, newPage));
    }
    setQuestionsPerPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('questionsPerPage', String(value));
      return newValue;
    });
  };

  let shownTitle = title;
  let link = undefined;
  if (author) {
    shownTitle = `Questions by `;
    link = <EntityRefLink entityRef={author} hideIcon defaultKind="user" />;
  } else if (entity) {
    shownTitle = `Questions about `;
    link = <EntityRefLink entityRef={entity} />;
  } else if (tags) {
    shownTitle = `Questions tagged with [${tags.join(', ')}]`;
  } else if (favorite) {
    shownTitle = 'Your favorite questions';
  }

  return (
    <Box className="qetaQuestionsContainer">
      {showTitle && (
        <Typography
          variant="h5"
          className="qetaQuestionsContainerTitle"
          style={{ marginBottom: '1.5rem' }}
        >
          {shownTitle}
          {link}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            id="search-bar"
            fullWidth
            onChange={onSearchQueryChange}
            label="Search for questions"
            className="qetaQuestionsContainerSearchInput"
            variant="outlined"
            placeholder="Search..."
            size="small"
            style={{ marginBottom: '5px' }}
          />
        </Grid>
        {showAskButton && (
          <Grid item>
            <AskQuestionButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
      </Grid>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography
            variant="h6"
            className="qetaQuestionsContainerQuestionCount"
          >{`${response?.total ?? 0} ${
            response?.total === 1 ? 'question' : 'questions'
          }`}</Typography>
        </Grid>
        {(showFilters ?? true) && (
          <Grid item>
            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="qetaQuestionsContainerFilterPanelBtn"
              startIcon={<FilterList />}
            >
              Filter
            </Button>
          </Grid>
        )}
      </Grid>
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel onChange={onFilterChange} filters={filters} />
        </Collapse>
      )}

      <QuestionList
        loading={loading}
        error={error}
        response={response}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        entity={entity}
        page={page}
        pageSize={questionsPerPage}
        showNoQuestionsBtn={showNoQuestionsBtn}
        entityPage={entity !== undefined}
        tags={tags}
      />
    </Box>
  );
};
