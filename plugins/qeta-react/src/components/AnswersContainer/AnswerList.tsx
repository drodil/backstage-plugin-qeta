import { Progress, WarningPanel } from '@backstage/core-components';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { AnswersResponse } from '@drodil/backstage-plugin-qeta-common';
import { AnswerListItem } from './AnswerListItem';
import { useTranslation } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';

export const AnswerList = (props: {
  loading: boolean;
  error: any;
  response?: AnswersResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  page: number;
  pageSize: number;
  entity?: string;
  tags?: string[];
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
  } = props;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { t } = useTranslation();

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
      <WarningPanel severity="error" title={t('answerList.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (initialLoad && (!response.answers || response.answers.length === 0)) {
    return (
      <Card style={{ marginTop: '2rem' }}>
        <CardContent>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
          >
            <Grid item>
              <Typography variant="h6">{t('answerList.noAnswers')}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const pageCount =
    response.total < props.pageSize
      ? 1
      : Math.ceil(response.total / props.pageSize);

  return (
    <div ref={listRef}>
      <Box sx={{ mt: 2 }} className="qetaAnswerList">
        <Card>
          <Grid container spacing={2} style={{ paddingTop: '1rem' }}>
            {response.answers.map(answer => {
              return (
                <Grid item xs={12} key={answer.id}>
                  <AnswerListItem answer={answer} entity={entity} />
                  <Divider />
                </Grid>
              );
            })}
          </Grid>
        </Card>
        <QetaPagination
          pageSize={props.pageSize}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          page={page}
          pageCount={pageCount}
          tooltip={t('answerList.limitSelect')}
        />
      </Box>
    </div>
  );
};
