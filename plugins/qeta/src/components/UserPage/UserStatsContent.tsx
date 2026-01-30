import {
  StatsChart,
  useQetaApi,
  UserBadges,
} from '@drodil/backstage-plugin-qeta-react';
import {
  StatisticsResponse,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import { Card, CardContent, CircularProgress, Grid } from '@material-ui/core';

export const UserStatsContent = (props: {
  userRef: string;
  stats?: StatisticsResponse<UserStat>;
  loading?: boolean;
}) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api => {
      if (props.stats) {
        return Promise.resolve(props.stats);
      }
      return api.getUserStats(props.userRef);
    },
    [props.userRef, props.stats],
  );

  const stats = props.stats || response;
  const isLoading = props.loading || loading;

  if (error) {
    return null;
  }
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <UserBadges entityRef={props.userRef} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {!isLoading && stats && (
              <StatsChart
                data={stats.statistics}
                summary={stats.summary as unknown as Record<string, number>}
              />
            )}
            {isLoading && !props.stats && <CircularProgress />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
