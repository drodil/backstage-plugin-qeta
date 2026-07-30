import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  qetaTranslationRef,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { RiStarLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const FavoritePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('favoritePage.title')}
        titleIcon={<RiStarLine size={28} />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <PostsContainer
        favorite
        showNoQuestionsBtn={false}
        showTypeLabel
        defaultView="list"
        prefix="favorites"
      />
    </>
  );
};
