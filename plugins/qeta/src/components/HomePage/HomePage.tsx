import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  FollowedEntitiesList,
  FollowedTagsList,
  ImpactCard,
  PostsCard,
  useIdentityApi,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import React from 'react';
import { Grid } from '@material-ui/core';

export const HomePage = () => {
  const { t } = useTranslation();
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('homePage.title')}>
          <AskQuestionButton />
        </ContentHeader>
        <Grid container>
          {user && !loadingUser && !userError && (
            <Grid item xs={12}>
              <PostsCard
                type="own"
                title={t('highlights.own.title')}
                options={{ author: user.userEntityRef }}
                postType="question"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <PostsCard
              type="own"
              title={t('highlights.unanswered.title')}
              options={{ noAnswers: 'true', random: 'true', type: 'question' }}
              postType="question"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item lg={3} xl={2}>
        <ImpactCard />
        <FollowedTagsList />
        <FollowedEntitiesList />
      </Grid>
    </Grid>
  );
};
