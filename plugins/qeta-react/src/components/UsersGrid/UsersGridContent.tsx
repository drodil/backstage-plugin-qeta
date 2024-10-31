import { Grid, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { UsersResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { UsersGridItem } from './UsersGridItem';
import { NoUsersCard } from './NoUsersCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';

export const UsersGridContent = (props: {
  loading: boolean;
  error: any;
  response?: UsersResponse;
}) => {
  const { response, error, loading } = props;
  const { t } = useTranslation();
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading) {
    if (initialLoad) {
      return <LoadingGrid />;
    }
    return null;
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
    <>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaUsersContainerTitle">
          {t('usersPage.users', { count: response.total })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {response.users.map(entity => (
          <UsersGridItem user={entity} key={entity.userRef} />
        ))}
      </Grid>
    </>
  );
};
