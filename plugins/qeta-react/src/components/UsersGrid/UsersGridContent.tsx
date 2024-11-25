import React from 'react';
import { UsersResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { UsersGridItem } from './UsersGridItem';
import { NoUsersCard } from './NoUsersCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';

export const UsersGridContent = (props: {
  loading: boolean;
  error: any;
  response?: UsersResponse;
}) => {
  const { response, error, loading } = props;
  const { t } = useTranslation();

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('usersPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.users || response.users.length === 0) {
    return <NoUsersCard />;
  }

  return (
    <Grid container item xs={12} alignItems="stretch">
      {response.users.map(entity => (
        <UsersGridItem user={entity} key={entity.userRef} />
      ))}
    </Grid>
  );
};
