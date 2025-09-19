import { ContentHeader } from '@backstage/core-components';
import {
  AskQuestionButton,
  ButtonContainer,
  CreateLinkButton,
  PostHighlightListContainer,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  ViewType,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';

export const FavoritePage = () => {
  const [view, setView] = useState<ViewType>('list');
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={t('favoritePage.title')}>
          <ButtonContainer>
            <AskQuestionButton />
            <WriteArticleButton />
            <CreateLinkButton />
          </ButtonContainer>
        </ContentHeader>
        {view === 'grid' ? (
          <PostsGrid
            favorite
            showNoQuestionsBtn={false}
            view={view}
            onViewChange={setView}
          />
        ) : (
          <PostsContainer
            favorite
            showNoQuestionsBtn={false}
            showTypeLabel
            view={view}
            onViewChange={setView}
          />
        )}
      </Grid>
      <Grid item lg={3} xl={2}>
        <PostHighlightListContainer options={{ favorite: true }} />
      </Grid>
    </Grid>
  );
};
