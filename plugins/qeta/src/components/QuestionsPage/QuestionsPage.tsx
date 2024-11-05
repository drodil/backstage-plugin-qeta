import { useSearchParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import {
  AskQuestionButton,
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  PostsContainer,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import Grid from '@mui/material/Grid';
import Whatshot from '@mui/icons-material/Whatshot';

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
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('questionsPage.title')}>
          <AskQuestionButton entity={entityRef} tags={tags} />
        </ContentHeader>
        <PostsContainer entity={entityRef} tags={tags} type="question" />
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
