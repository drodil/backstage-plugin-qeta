import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  FollowedTagsList,
  QuestionHighlightList,
  QuestionsContainer,
  TagFollowButton,
  TagsContainer,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslation();
  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader
          title={
            tag
              ? t('tagPage.taggedWithTitle', { tag })
              : t('tagPage.defaultTitle')
          }
        >
          {tag && <TagFollowButton tag={tag} />}
          <AskQuestionButton tags={tag ? [tag] : undefined} />
        </ContentHeader>
        {tag ? <QuestionsContainer tags={[tag ?? '']} /> : <TagsContainer />}
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedTagsList />
        <QuestionHighlightList
          type="hot"
          title={t('highlights.hot.title')}
          noQuestionsLabel={t('highlights.hot.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ tags: [tag ?? ''] }}
        />
        <QuestionHighlightList
          type="unanswered"
          title={t('highlights.unanswered.title')}
          noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
          options={{ tags: [tag ?? ''] }}
        />
        <QuestionHighlightList
          type="incorrect"
          title={t('highlights.incorrect.title')}
          noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
          options={{ tags: [tag ?? ''] }}
        />
      </Grid>
    </Grid>
  );
};
