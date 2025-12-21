import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  PostsCard,
  qetaTranslationRef,
  SuggestionsCard,
  useIdentityApi,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
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
        title={t('homePage.title')}
        titleIcon={<HomeOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
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
