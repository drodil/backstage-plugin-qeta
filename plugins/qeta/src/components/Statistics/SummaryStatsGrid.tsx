import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { StatisticsResponse } from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import numeral from 'numeral';
import { useTranslation } from '../../utils/hooks';

const SummaryCard = (props: { title: string; value: number }) => {
  const { title, value } = props;
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">
          {value >= 1000 ? numeral(value).format('0.0 a') : value}
          <Typography variant="caption" style={{ marginLeft: '1rem' }}>
            {title}
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
};

export const SummaryStatsGrid = (props: { stats: StatisticsResponse }) => {
  const { stats } = props;
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid item xs={4}>
        <SummaryCard
          title={t('stats.questions')}
          value={stats.summary.totalQuestions}
        />
      </Grid>
      <Grid item xs={4}>
        <SummaryCard
          title={t('stats.answers')}
          value={stats.summary.totalAnswers}
        />
      </Grid>
      <Grid item xs={4}>
        <SummaryCard
          title={t('stats.comments')}
          value={stats.summary.totalComments}
        />
      </Grid>
      <Grid item xs={4}>
        <SummaryCard
          title={t('stats.views')}
          value={stats.summary.totalViews}
        />
      </Grid>
      <Grid item xs={4}>
        <SummaryCard
          title={t('stats.votes')}
          value={stats.summary.totalVotes}
        />
      </Grid>
    </Grid>
  );
};
