import { ContentHeader } from '@backstage/core-components';
import {
  ButtonContainer,
  CollectionsGrid,
  CreateCollectionButton,
  FollowedCollectionsList,
  qetaTranslationRef,
  useCollectionsFollow,
} from '@drodil/backstage-plugin-qeta-react';
import { Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionsPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const collections = useCollectionsFollow();

  return (
    <Grid container spacing={4}>
      <Grid
        item
        md={12}
        lg={collections.collections.length > 0 ? 9 : 12}
        xl={collections.collections.length > 0 ? 10 : 12}
      >
        <ContentHeader title={t('collectionsPage.title')}>
          <ButtonContainer>
            <CreateCollectionButton />
          </ButtonContainer>
        </ContentHeader>
        <CollectionsGrid />
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedCollectionsList />
      </Grid>
    </Grid>
  );
};
