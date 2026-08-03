import {
  CollectionsContainer,
  CreateCollectionButton,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionsPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.collections) {
    return null;
  }

  return (
    <>
      <Header
        title={t('collectionsPage.title')}
        customActions={<CreateCollectionButton />}
      />
      <CollectionsContainer />
    </>
  );
};
