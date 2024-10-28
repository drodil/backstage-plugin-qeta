import { Grid, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { UsersResponse } from '@drodil/backstage-plugin-qeta-common';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { UsersGridItem } from './UsersGridItem';

export const UsersGridContent = (props: {
  loading: boolean;
  error: any;
  response?: UsersResponse;
}) => {
  const { response, loading, error } = props;
  const { t } = useTranslation();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading && initialLoad) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
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
