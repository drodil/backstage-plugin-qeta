import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  ButtonContainer,
  PostHighlightList,
  PostsContainer,
  qetaTranslationRef,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Whatshot from '@material-ui/icons/Whatshot';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const FavoritePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('favoritePage.title')}>
          <ButtonContainer>
            <AskQuestionButton />
            <WriteArticleButton />
          </ButtonContainer>
        </ContentHeader>
        <PostsContainer favorite showNoQuestionsBtn={false} showTypeLabel />
      </Grid>
      <Grid item lg={3} xl={2}>
        <PostHighlightList
          type="hot"
          title={t('highlights.hotQuestions.title')}
          noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ favorite: true }}
          postType="question"
        />
        <PostHighlightList
          type="hot"
          title={t('highlights.hotArticles.title')}
          noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ favorite: true }}
          postType="article"
        />
      </Grid>
    </Grid>
  );
};
