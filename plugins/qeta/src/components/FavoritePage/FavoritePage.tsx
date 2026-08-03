import {
  PostsContainer,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const FavoritePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <Header title={t('favoritePage.title')} />
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
