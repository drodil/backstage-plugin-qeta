import {
  CollectionsContainer,
  ContentHeader,
  CreateCollectionButton,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { RiPlayListLine } from '@remixicon/react';
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
        titleIcon={<RiPlayListLine size={24} />}
      >
        <CreateCollectionButton />
      </ContentHeader>
      <CollectionsContainer />
    </>
  );
};
