import { useQetaApi } from '../../utils/hooks';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
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
}
export const QuestionsContainer = (props: QuestionsContainerProps) => {
  const { tags, author, entity, showFilters, showTitle, title } = props;
  const [page, setPage] = React.useState(1);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = React.useState({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
  });
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

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
      if (key === 'page') {
        setPage(Number.parseInt(value, 10));
      } else if (key in filterKeys) {
        filtersApplied = true;
        filters[key as FilterKey] = value;
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
        limit: pageSize,
        offset,
        tags,
        entity,
        author,
        ...filters,
      }),
    [page, offset, filters],
  );

  let shownTitle = title;
  if (author) {
    shownTitle = `Questions by ${formatEntityName(author)}`;
  } else if (entity) {
    shownTitle = `Questions about ${formatEntityName(entity)}`;
  } else if (tags) {
    shownTitle = `Questions tagged with [${tags.join(', ')}]`;
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
            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
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
        entity={entity}
        page={page}
      />
    </Box>
  );
};
