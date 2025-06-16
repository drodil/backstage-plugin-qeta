import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AskQuestionButton,
  ButtonContainer,
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import Whatshot from '@material-ui/icons/Whatshot';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const QuestionsPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('list');

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('questionsPage.title')}>
          <ButtonContainer>
            <AskQuestionButton entity={entityRef} tags={tags} />
          </ButtonContainer>
        </ContentHeader>
        {view === 'grid' ? (
          <PostsGrid type="question" view={view} onViewChange={setView} />
        ) : (
          <PostsContainer type="question" view={view} onViewChange={setView} />
        )}
      </Grid>
      <Grid item lg={3} xl={2}>
        <PostHighlightList
          type="hot"
          title={t('highlights.hotQuestions.title')}
          noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{
            tags: tags,
            entities: entityRef ? [entityRef] : undefined,
          }}
          postType="question"
        />
        <PostHighlightList
          type="unanswered"
          title={t('highlights.unanswered.title')}
          noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
          options={{
            tags: tags,
            entities: entityRef ? [entityRef] : undefined,
          }}
          postType="question"
        />
        <PostHighlightList
          type="incorrect"
          title={t('highlights.incorrect.title')}
          noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
          options={{
            tags: tags,
            entities: entityRef ? [entityRef] : undefined,
          }}
          postType="question"
        />
        <FollowedTagsList />
        <FollowedEntitiesList />
      </Grid>
    </Grid>
  );
};
