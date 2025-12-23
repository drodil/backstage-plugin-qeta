import { Progress, WarningPanel } from '@backstage/core-components';
import { useRef } from 'react';
import { AnswersResponse } from '@drodil/backstage-plugin-qeta-common';
import { AnswerListItem } from './AnswerListItem';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useInfiniteScroll } from 'infinite-scroll-hook';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@material-ui/core';

export const AnswerList = (props: {
  loading: boolean;
  error: any;
  response?: AnswersResponse;
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const { loading, error, response, entity, hasMore, loadNextPage } = props;
  const listRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslationRef(qetaTranslationRef);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: !hasMore || !!error || loading,
    onLoadMore: async () => {
      if (loadNextPage) {
        await loadNextPage();
      }
    },
    offset: '800px',
  }) as any;

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('answerList.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response.answers || response.answers.length === 0) {
    return (
      <Card style={{ marginTop: '2em' }}>
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

  return (
    <div ref={listRef}>
      <Box sx={{ mt: 2 }} className="qetaAnswerList">
        <Card>
          <Grid container spacing={0}>
            {response.answers.map((answer, i) => {
              return (
                <Grid item xs={12} key={answer.id}>
                  <AnswerListItem answer={answer} entity={entity} />
                  {i !== response.answers.length - 1 && <Divider />}
                </Grid>
              );
            })}
          </Grid>
        </Card>
        <div ref={sentryRef} style={{ marginTop: '10px', textAlign: 'center' }}>
          {loading && <LoadingGrid />}
        </div>
      </Box>
    </div>
  );
};
