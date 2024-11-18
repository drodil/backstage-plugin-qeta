import {
  StatsChart,
  SummaryStatsGrid,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

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
