import { useQetaApi } from '../../utils/hooks';
import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { StatsChart } from '../Statistics/StatsChart';

export const UserStatsCard = (props: { userRef: string }) => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUserStats(props.userRef), []);
  if (loading || error || !response) {
    return null;
  }
  return (
    <Card>
      <CardContent>
        <StatsChart data={response.statistics} />
      </CardContent>
    </Card>
  );
};
