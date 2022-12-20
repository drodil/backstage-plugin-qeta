import { useQetaApi, useStyles } from '../../../utils/hooks';
import { WarningPanel } from '@backstage/core-components';
import { Box, Divider, Grid } from '@material-ui/core';
import React from 'react';
import { QuestionListItem } from './QuestionListItem';
import { Pagination, Skeleton } from '@material-ui/lab';

export const QuestionList = (props: { tags?: string[]; author?: string }) => {
  const { tags, author } = props;
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const styles = useStyles();

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => api.getQuestions({ limit: pageSize, offset, tags, author }),
    [page, offset],
  );

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
    return <Box>No questions found</Box>;
  }

  const pageCount =
    response.total < pageSize ? 1 : Math.ceil(response.total / pageSize);

  return (
    <Box>
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
