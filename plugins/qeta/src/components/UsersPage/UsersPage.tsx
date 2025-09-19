import {
  FollowedUsersList,
  PostHighlightListContainer,
  qetaTranslationRef,
  UsersGrid,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('usersPage.title')} />
        <UsersGrid />
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedUsersList />
        <PostHighlightListContainer />
      </Grid>
    </Grid>
  );
};
