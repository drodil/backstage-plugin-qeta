import { useQetaApi } from '../../utils/hooks';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { FilterKey, FilterPanel } from './FilterPanel';
import { QuestionList } from './QuestionList';
import FilterList from '@material-ui/icons/FilterList';

export const QuestionsContainer = (props: {
  tags?: string[];
  author?: string;
}) => {
  const { tags, author } = props;
  const [page, setPage] = React.useState(1);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filters, setFilters] = React.useState({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
  });
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const onPageChange = (value: number) => {
    setPage(value);
  };

  const onFilterChange = (key: FilterKey, value: string) => {
    setFilters({ ...filters, ...{ [key]: value } });
  };

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getQuestions({ limit: pageSize, offset, tags, author, ...filters }),
    [page, offset, filters],
  );

  return (
    <Box>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h6">{`${
            response?.questions.length ?? 0
          } questions`}</Typography>
        </Grid>
        <Grid item>
          <Button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            startIcon={<FilterList />}
          >
            Filter
          </Button>
        </Grid>
      </Grid>
      <Collapse in={showFilterPanel}>
        <FilterPanel onChange={onFilterChange} filters={filters} />
      </Collapse>

      <QuestionList
        loading={loading}
        error={error}
        response={response}
        onPageChange={onPageChange}
      />
    </Box>
  );
};
