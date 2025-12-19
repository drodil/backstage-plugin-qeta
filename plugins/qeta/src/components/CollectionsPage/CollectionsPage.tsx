import { ContentHeader } from '@backstage/core-components';
import {
  ButtonContainer,
  CollectionsGrid,
  CreateCollectionButton,
  FollowedCollectionsList,
  qetaTranslationRef,
  useCollectionsFollow,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Grid, Typography } from '@material-ui/core';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined';
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
        <ContentHeader
          titleComponent={
            <Typography
              variant="h4"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <PlaylistPlayOutlined
                fontSize="large"
                style={{ marginRight: '8px' }}
              />
              {t('collectionsPage.title')}
            </Typography>
          }
        >
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
