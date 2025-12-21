import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  ViewType,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import StarBorder from '@material-ui/icons/StarBorder';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';

export const FavoritePage = () => {
  const [view, setView] = useState<ViewType>('list');
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('favoritePage.title')}
        titleIcon={<StarBorder fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
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
    </>
  );
};
