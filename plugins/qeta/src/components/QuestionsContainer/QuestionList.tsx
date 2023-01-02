import { useStyles } from '../../utils/hooks';
import { WarningPanel } from '@backstage/core-components';
import { Box, Button, Divider, Grid, Typography } from '@material-ui/core';
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
  entity?: string;
}) => {
  const { loading, error, response, onPageChange, entity } = props;
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const styles = useStyles();

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onPageChange(value);
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
    response.total < pageSize ? 1 : Math.ceil(response.total / pageSize);

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
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Pagination
          page={page}
          onChange={handleChange}
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
