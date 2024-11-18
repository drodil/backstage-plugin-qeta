import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  PostHighlightList,
  PostsContainer,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Grid from '@mui/material/Grid';
import Whatshot from '@mui/icons-material/Whatshot';

export const FavoritePage = () => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={8} xl={9}>
        <ContentHeader title={t('favoritePage.title')}>
          <AskQuestionButton />
          <WriteArticleButton />
        </ContentHeader>
        <PostsContainer favorite showNoQuestionsBtn={false} />
      </Grid>
      <Grid item lg={4} xl={3}>
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
