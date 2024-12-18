import {
  StatsChart,
  SummaryStatsGrid,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';

export const UserStatsContent = (props: { userRef: string }) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUserStats(props.userRef), []);
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
