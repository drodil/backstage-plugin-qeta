import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  QuestionHighlightList,
  QuestionsContainer,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';

export const FavoritePage = () => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('favoritePage.title')}>
          <AskQuestionButton />
        </ContentHeader>
        <QuestionsContainer favorite />
      </Grid>
      <Grid item lg={3} xl={2}>
        <QuestionHighlightList
          type="hot"
          title={t('highlights.hot.title')}
          noQuestionsLabel={t('highlights.hot.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ favorite: true }}
        />
        <QuestionHighlightList
          type="unanswered"
          title={t('highlights.unanswered.title')}
          noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
          options={{ favorite: true }}
        />
        <QuestionHighlightList
          type="incorrect"
          title={t('highlights.incorrect.title')}
          noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
          options={{ favorite: true }}
        />
      </Grid>
    </Grid>
  );
};
