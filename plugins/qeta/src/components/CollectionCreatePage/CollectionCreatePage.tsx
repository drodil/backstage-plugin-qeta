import { useParams } from 'react-router-dom';
import {
  CollectionForm,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionCreatePage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.collections) {
    return null;
  }

  let title;
  if (id) {
    title = t('collectionCreatePage.title.existingCollection');
  } else {
    title = t('collectionCreatePage.title.newCollection');
  }
  return (
    <>
      <Header title={title} />
      <Box>
        <CollectionForm id={id} />
      </Box>
    </>
  );
};
