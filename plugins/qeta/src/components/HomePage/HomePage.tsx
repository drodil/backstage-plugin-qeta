import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import React from 'react';
import { useIdentityApi, useTranslation } from '../../utils/hooks';
import { QuestionsCard } from '../HomePageCards/QuestionsCard';
import { Grid } from '@material-ui/core';
import { FollowedTagsList } from '../QetaPage/FollowedTagsList';
import { FollowedEntitiesList } from '../QetaPage/FollowedEntitiesList';
import { ImpactCard } from '../HomePageCards/ImpactCard';

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
              <QuestionsCard
                type="own"
                title={t('highlights.own.title')}
                options={{ author: user.userEntityRef }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <QuestionsCard
              type="own"
              title={t('highlights.unanswered.title')}
              options={{ noAnswers: 'true', random: 'true' }}
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
