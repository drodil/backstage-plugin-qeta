import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import React from 'react';
import { useIdentityApi, useTranslation } from '../../utils/hooks';
import { QuestionsCard } from '../HomePageCards/QuestionsCard';
import { Grid } from '@material-ui/core';

export const HomePage = () => {
  const { t } = useTranslation();
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  return (
    <>
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
    </>
  );
};
