import {
  CollectionsContainer,
  ContentHeader,
  CreateCollectionButton,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionsPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.collections) {
    return null;
  }

  return (
    <>
      <ContentHeader
        title={t('collectionsPage.title')}
        titleIcon={<PlaylistPlayOutlined fontSize="large" />}
      >
        <CreateCollectionButton />
      </ContentHeader>
      <CollectionsContainer />
    </>
  );
};
