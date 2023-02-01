import { useStyles } from '../../utils/hooks';
import { WarningPanel } from '@backstage/core-components';
import {
  Box,
  Button,
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
import { Pagination, Skeleton } from '@material-ui/lab';
import { QuestionsResponse } from '../../api';
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
}) => {
  const {
    loading,
    error,
    response,
    onPageChange,
    entity,
    page,
    onPageSizeChange,
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
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load questions.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (response.questions.length === 0) {
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
        <Grid item>
          <Button
            href={entity ? `/qeta/ask?entity=${entity}` : '/qeta/ask'}
            startIcon={<HelpOutline />}
          >
            Go ahead and ask one!
          </Button>
        </Grid>
      </Grid>
    );
  }

  const pageCount =
    response.total < props.pageSize
      ? 1
      : Math.ceil(response.total / props.pageSize);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {response.questions.map(question => {
          return (
            <Grid item xs={12} key={question.id}>
              <QuestionListItem question={question} />
              <Divider />
            </Grid>
          );
        })}
      </Grid>
      <Grid
        container
        spacing={0}
        className={styles.questionListPagination}
        alignItems="center"
        justifyContent="space-between"
      >
        <Tooltip title="Questions per page" arrow>
          <FormControl variant="filled">
            <Select
              value={props.pageSize}
              onChange={handlePageSizeChange}
              className={styles.questionsPerPage}
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
          showFirstButton
          showLastButton
        />
      </Grid>
    </Box>
  );
};
