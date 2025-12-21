import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  CollectionsGrid,
  qetaTranslationRef,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionsPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('collectionsPage.title')}
        titleIcon={<PlaylistPlayOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <CollectionsGrid />
    </>
  );
};
