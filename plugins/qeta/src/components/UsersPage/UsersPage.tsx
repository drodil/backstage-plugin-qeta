import React from 'react';
import {
  FollowedUsersList,
  UsersGrid,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import Grid from '@mui/material/Grid';

export const UsersPage = () => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={8} xl={9}>
        <ContentHeader title={t('usersPage.title')} />
        <UsersGrid />
      </Grid>
      <Grid item lg={4} xl={3}>
        <FollowedUsersList />
      </Grid>
    </Grid>
  );
};
