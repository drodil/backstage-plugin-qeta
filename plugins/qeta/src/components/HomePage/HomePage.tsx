import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  ButtonContainer,
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  ImpactCard,
  PostsCard,
  qetaTranslationRef,
  SuggestionsCard,
  useIdentityApi,
  WriteArticleButton,
  CreateLinkButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Grid, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import HomeOutlined from '@material-ui/icons/HomeOutlined';

export const HomePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    value: user,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader
          titleComponent={
            <Typography
              variant="h4"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeOutlined fontSize="large" style={{ marginRight: '8px' }} />
              {t('homePage.title')}
            </Typography>
          }
        >
          <ButtonContainer>
            <AskQuestionButton />
            <WriteArticleButton />
            <CreateLinkButton />
          </ButtonContainer>
        </ContentHeader>
        <Grid container>
          <Grid item xs={12}>
            <SuggestionsCard />
          </Grid>
          <Grid item xs={12}>
            <PostsCard
              title={t('highlights.unanswered.title')}
              options={{ noAnswers: true, random: true, type: 'question' }}
              postType="question"
            />
          </Grid>
          {user && !loadingUser && !userError && (
            <Grid item xs={12}>
              <PostsCard
                title={t('highlights.own.title')}
                options={{ author: user.userEntityRef }}
                postType="question"
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item lg={3} xl={2}>
        <ImpactCard />
        <FollowedTagsList />
        <FollowedUsersList />
        <FollowedEntitiesList />
        <FollowedCollectionsList />
      </Grid>
    </Grid>
  );
};
