import { StatsChart, useQetaApi } from '@drodil/backstage-plugin-qeta-react';
import { Card, CardBody, CardHeader, Grid, Skeleton } from '@backstage/ui';

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
    <Grid.Root columns={{ sm: '12' }} gap="6">
      <Grid.Item colSpan={{ sm: '12' }}>
        <Card>
          <CardHeader>Activity Trends</CardHeader>
          <CardBody>
            {!loading && response && (
              <StatsChart
                data={response.statistics}
                summary={response.summary as unknown as Record<string, number>}
              />
            )}
            {loading && <Skeleton width="100%" height={300} />}
          </CardBody>
        </Card>
      </Grid.Item>
    </Grid.Root>
  );
};
