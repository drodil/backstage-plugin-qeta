import { useQetaApi } from '../../utils/hooks';
import { StatsChart } from './StatsChart';
import React from 'react';
import { Card, CardContent } from '@material-ui/core';

export const GlobalStatsCard = () => {
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getGlobalStats(), []);
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
