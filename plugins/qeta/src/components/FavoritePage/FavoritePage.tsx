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
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('favoritePage.title')}>
          <AskQuestionButton />
          <WriteArticleButton />
        </ContentHeader>
        <PostsContainer favorite />
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
