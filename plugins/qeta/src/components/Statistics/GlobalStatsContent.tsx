import { useQetaApi } from '../../utils/hooks';
import { StatsChart } from './StatsChart';
import React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import { SummaryStatsGrid } from './SummaryStatsGrid';

export const GlobalStatsContent = () => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getGlobalStats(), []);
  if (loading || error || !response) {
    return null;
  }
  return (
    <Grid container>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <StatsChart data={response.statistics} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <SummaryStatsGrid stats={response} />
      </Grid>
    </Grid>
  );
};
