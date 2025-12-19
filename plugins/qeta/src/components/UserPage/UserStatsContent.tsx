import { StatsChart, useQetaApi } from '@drodil/backstage-plugin-qeta-react';
import { Card, CardContent, CircularProgress, Grid } from '@material-ui/core';

export const UserStatsContent = (props: { userRef: string }) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUserStats(props.userRef), []);
  if (error) {
    return null;
  }
  return (
    <Grid container>
      <Grid item xs={12}>
        <Card>
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
