import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  qetaTranslationRef,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import StarBorder from '@material-ui/icons/StarBorder';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const FavoritePage = () => {
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
      <PostsContainer
        favorite
        showNoQuestionsBtn={false}
        showTypeLabel
        defaultView="list"
      />
    </>
  );
};
