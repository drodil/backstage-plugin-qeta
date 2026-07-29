import { useParams } from 'react-router-dom';
import { ContentHeader, InfoCard } from '@backstage/core-components';
import {
  CollectionForm,
  qetaTranslationRef,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
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
      <ContentHeader title={title} />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <CollectionForm id={id} />
          </InfoCard>
        </Grid>
      </Grid>
    </>
  );
};
