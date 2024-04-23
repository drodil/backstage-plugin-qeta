import { useStyles } from '../../utils/hooks';
import { Progress, WarningPanel } from '@backstage/core-components';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { QuestionListItem } from './QuestionListItem';
import { Pagination } from '@material-ui/lab';
import { QuestionsResponse } from '@drodil/backstage-plugin-qeta-common';
import { NoQuestionsCard } from './NoQuestionsCard';

export const QuestionList = (props: {
  loading: boolean;
  error: any;
  response?: QuestionsResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  page: number;
  pageSize: number;
  entity?: string;
  tags?: string[];
  showNoQuestionsBtn?: boolean;
  entityPage?: boolean;
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
    entityPage,
    tags,
  } = props;
  const styles = useStyles();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
    }
    onPageChange(value);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
    }
    onPageSizeChange(Number.parseInt(event.target.value as string, 10));
  };

  if (loading && initialLoad) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load questions.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (initialLoad && (!response.questions || response.questions.length === 0)) {
    return (
      <NoQuestionsCard
        showNoQuestionsBtn={showNoQuestionsBtn}
        entity={entity}
        entityPage={entityPage}
        tags={tags}
      />
    );
  }

  const pageCount =
    response.total < props.pageSize
      ? 1
      : Math.ceil(response.total / props.pageSize);

  return (
    <div ref={listRef}>
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
    </div>
  );
};
