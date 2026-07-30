import {
  StatsChart,
  useQetaApi,
  UserBadges,
} from '@drodil/backstage-plugin-qeta-react';
import {
  StatisticsResponse,
  UserStat,
} from '@drodil/backstage-plugin-qeta-common';
import { Card, CardBody, Grid, Skeleton } from '@backstage/ui';

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
    <Grid.Root columns={{ sm: '12' }} gap="6">
      <Grid.Item colSpan={{ sm: '12' }}>
        <Card>
          <CardBody>
            <UserBadges entityRef={props.userRef} />
          </CardBody>
        </Card>
      </Grid.Item>
      <Grid.Item colSpan={{ sm: '12' }}>
        <Card>
          <CardBody>
            {!isLoading && stats && (
              <StatsChart
                data={stats.statistics}
                summary={stats.summary as unknown as Record<string, number>}
              />
            )}
            {isLoading && !props.stats && (
              <Skeleton width="100%" height={300} />
            )}
          </CardBody>
        </Card>
      </Grid.Item>
    </Grid.Root>
  );
};
