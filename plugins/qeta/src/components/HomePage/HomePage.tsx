import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  ButtonContainer,
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  ImpactCard,
  PostsCard,
  qetaTranslationRef,
  SuggestionsCard,
  useIdentityApi,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

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
        <ContentHeader title={t('homePage.title')}>
          <ButtonContainer>
            <AskQuestionButton />
            <WriteArticleButton />
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
        <FollowedEntitiesList />
        <FollowedCollectionsList />
      </Grid>
    </Grid>
  );
};
