import { StatsChart, useQetaApi } from '@drodil/backstage-plugin-qeta-react';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
} from '@material-ui/core';

export const GlobalStatsContent = () => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getGlobalStats(), []);
  if (error) {
    return null;
  }
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Activity Trends" />
          <CardContent>
            {!loading && response && (
              <StatsChart
                data={response.statistics}
                summary={response.summary as unknown as Record<string, number>}
              />
            )}
            {loading && <CircularProgress />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
