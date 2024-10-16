import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { QuestionsContainer } from '../QuestionsContainer/QuestionsContainer';
import { TagsContainer } from './TagsContainer';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { useTranslation } from '../../utils/hooks';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import { Grid } from '@material-ui/core';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import Whatshot from '@material-ui/icons/Whatshot';
import { FollowedTagsList } from '../QetaPage/FollowedTagsList';

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
