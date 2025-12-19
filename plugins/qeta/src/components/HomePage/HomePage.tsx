import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  ButtonContainer,
  PostsCard,
  qetaTranslationRef,
  SuggestionsCard,
  useIdentityApi,
  WriteArticleButton,
  CreateLinkButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid, Typography } from '@material-ui/core';
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
    <>
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
    </>
  );
};
