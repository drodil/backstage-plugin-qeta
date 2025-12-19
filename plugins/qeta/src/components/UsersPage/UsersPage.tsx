import {
  FollowedUsersList,
  PostHighlightListContainer,
  qetaTranslationRef,
  UsersGrid,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { Box, Grid, Typography } from '@material-ui/core';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader
          titleComponent={
            <Typography
              variant="h4"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <PeopleOutline fontSize="large" style={{ marginRight: '8px' }} />
              {t('usersPage.title')}
            </Typography>
          }
        />
        <UsersGrid />
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedUsersList />
        <PostHighlightListContainer />
      </Grid>
    </Grid>
  );
};
