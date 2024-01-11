import { useStyles } from '../../utils/hooks';
import { LinkButton, Progress, WarningPanel } from '@backstage/core-components';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { QuestionListItem } from './QuestionListItem';
import { Pagination } from '@material-ui/lab';
import { QuestionsResponse } from '@drodil/backstage-plugin-qeta-common';
import HelpOutline from '@material-ui/icons/HelpOutline';

export const QuestionList = (props: {
  loading: boolean;
  error: any;
  response?: QuestionsResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  page: number;
  pageSize: number;
  entity?: string;
  showNoQuestionsBtn?: boolean;
}) => {
  const {
    loading,
    error,
    response,
    onPageChange,
    entity,
    page,
    onPageSizeChange,
    showNoQuestionsBtn = true,
  } = props;
  const styles = useStyles();

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    onPageChange(value);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    onPageSizeChange(Number.parseInt(event.target.value as string, 10));
  };

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load questions.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response.questions || response.questions.length === 0) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <Grid item>
          <Typography variant="h6">No questions found</Typography>
        </Grid>
        {showNoQuestionsBtn && (
          <Grid item>
            <LinkButton
              to={entity ? `/qeta/ask?entity=${entity}` : '/qeta/ask'}
              startIcon={<HelpOutline />}
              color="primary"
              variant="outlined"
            >
              Go ahead and ask one!
            </LinkButton>
          </Grid>
        )}
      </Grid>
    );
  }

  const pageCount =
    response.total < props.pageSize
      ? 1
      : Math.ceil(response.total / props.pageSize);

  return (
    <Box sx={{ mt: 2 }} className="qetaQuestionList">
      <Grid container spacing={2} className="qetaQuestionListGrid">
        {response.questions.map(question => {
          return (
            <Grid item xs={12} key={question.id}>
              <QuestionListItem question={question} entity={entity} />
              <Divider />
            </Grid>
          );
        })}
      </Grid>
      <Grid
        container
        spacing={0}
        className={`qetaQuestionListPaginationGrid ${styles.questionListPagination}`}
        alignItems="center"
        justifyContent="space-between"
      >
        <Tooltip title="Questions per page" arrow>
          <FormControl variant="filled">
            <Select
              value={props.pageSize}
              onChange={handlePageSizeChange}
              className={`qetaQuestionListPaginationSizeSelect ${styles.questionsPerPage}`}
              inputProps={{ className: styles.questionsPerPageInput }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Tooltip>
        <Pagination
          page={page}
          onChange={handlePageChange}
          count={pageCount}
          size="large"
          variant="outlined"
          className="qetaQuestionListPagination"
          showFirstButton
          showLastButton
        />
      </Grid>
    </Box>
  );
};
