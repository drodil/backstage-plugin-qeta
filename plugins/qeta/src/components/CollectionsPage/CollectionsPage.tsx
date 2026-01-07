import {
  CollectionsGrid,
  ContentHeader,
  CreateCollectionButton,
  qetaTranslationRef,
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
        <CreateCollectionButton />
      </ContentHeader>
      <CollectionsGrid />
    </>
  );
};
