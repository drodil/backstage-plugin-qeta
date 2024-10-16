import { useSearchParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useTranslation } from '../../utils/hooks';
import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { QuestionsContainer } from '../QuestionsContainer';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { Grid } from '@material-ui/core';
import { QuestionHighlightList } from '../QuestionHighlightList/QuestionHighlightList';
import Whatshot from '@material-ui/icons/Whatshot';
import { FollowedTagsList } from '../QetaPage/FollowedTagsList';
import { FollowedEntitiesList } from '../QetaPage/FollowedEntitiesList';

export const QuestionsPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = React.useState<string | undefined>(
    undefined,
  );
  const [tags, setTags] = React.useState<string[] | undefined>(undefined);
  const { t } = useTranslation();
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <Grid container>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('questionsPage.title')}>
          <AskQuestionButton entity={entityRef} tags={tags} />
        </ContentHeader>
        <QuestionsContainer entity={entityRef} tags={tags} />
      </Grid>
      <Grid item lg={3} xl={2}>
        <QuestionHighlightList
          type="hot"
          title={t('highlights.hot.title')}
          noQuestionsLabel={t('highlights.hot.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ tags: tags, entity: entityRef }}
        />
        <QuestionHighlightList
          type="unanswered"
          title={t('highlights.unanswered.title')}
          noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
          options={{ tags: tags, entity: entityRef }}
        />
        <QuestionHighlightList
          type="incorrect"
          title={t('highlights.incorrect.title')}
          noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
          options={{ tags: tags, entity: entityRef }}
        />
        <FollowedTagsList />
        <FollowedEntitiesList />
      </Grid>
    </Grid>
  );
};
