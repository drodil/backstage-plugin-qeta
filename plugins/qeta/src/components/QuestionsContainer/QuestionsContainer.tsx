import { useQetaApi } from '../../utils/hooks';
import { Box, Collapse, Grid, Typography } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import React, { useEffect } from 'react';
import { FilterKey, filterKeys, FilterPanel } from './FilterPanel';
import { QuestionList } from './QuestionList';
import FilterList from '@material-ui/icons/FilterList';
import { useSearchParams } from 'react-router-dom';
import { formatEntityName } from '../../utils/utils';

export interface QuestionsContainerProps {
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  favorite?: boolean;
}
export const QuestionsContainer = (props: QuestionsContainerProps) => {
  const { tags, author, entity, showFilters, showTitle, title, favorite } =
    props;
  const [page, setPage] = React.useState(1);
  const [questionsPerPage, setQuestionsPerPage] = React.useState(10);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = React.useState({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
  });

  const onPageChange = (value: number) => {
    setPage(value);
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set('page', String(value));
      return newValue;
    });
  };

  const onFilterChange = (key: FilterKey, value: string) => {
    onPageChange(1);
    setFilters({ ...filters, ...{ [key]: value } });
    setSearchParams(prev => {
      const newValue = prev;
      newValue.set(key, value);
      return newValue;
    });
  };

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
        } else if (key in filterKeys) {
          filtersApplied = true;
          filters[key as FilterKey] = value;
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
    api =>
      api.getQuestions({
        limit: questionsPerPage,
        offset: (page - 1) * questionsPerPage,
        includeEntities: true,
        tags,
        entity,
        author,
        favorite,
        ...filters,
      }),
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
  if (author) {
    shownTitle = `Questions by ${formatEntityName(author)}`;
  } else if (entity) {
    shownTitle = `Questions about ${formatEntityName(entity)}`;
  } else if (tags) {
    shownTitle = `Questions tagged with [${tags.join(', ')}]`;
  } else if (favorite) {
    shownTitle = 'Your favorite questions';
  }

  return (
    <Box>
      {showTitle && <Typography variant="h5">{shownTitle}</Typography>}
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h6">{`${
            response?.total ?? 0
          } questions`}</Typography>
        </Grid>
        {(showFilters ?? true) && (
          <Grid item>
            <LinkButton
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              startIcon={<FilterList />}
            >
              Filter
            </LinkButton>
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
      />
    </Box>
  );
};
