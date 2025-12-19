import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AskQuestionButton,
  ButtonContainer,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { Box, Grid, Typography } from '@material-ui/core';
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
    <>
      <ContentHeader
        titleComponent={
          <Typography
            variant="h4"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <HelpOutline fontSize="large" style={{ marginRight: '8px' }} />
            {t('questionsPage.title')}
          </Typography>
        }
      >
        <ButtonContainer>
          <AskQuestionButton entity={entityRef} tags={tags} />
        </ButtonContainer>
      </ContentHeader>
      {view === 'grid' ? (
        <PostsGrid type="question" view={view} onViewChange={setView} />
      ) : (
        <PostsContainer type="question" view={view} onViewChange={setView} />
      )}
    </>
  );
};
