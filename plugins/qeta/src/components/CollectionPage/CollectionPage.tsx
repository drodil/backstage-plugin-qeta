import React from 'react';
import { useParams } from 'react-router-dom';
import {
  ButtonContainer,
  CollectionCard,
  CollectionFollowButton,
  CreateCollectionButton,
  PostsGrid,
  useQetaApi,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { Skeleton } from '@material-ui/lab';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';

export const CollectionPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const {
    value: collection,
    loading,
    error,
  } = useQetaApi(api => api.getCollection(id), [id]);

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || collection === undefined) {
    return (
      <WarningPanel severity="error" title={t('questionPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const title = (
    <Typography variant="h5" component="h2">
      {collection.title}
      <CollectionFollowButton
        collection={collection}
        style={{ marginLeft: '0.5em' }}
      />
    </Typography>
  );

  return (
    <>
      <ContentHeader
        titleComponent={title}
        description={t('collectionPage.info')}
      >
        <ButtonContainer>
          <CreateCollectionButton />
        </ButtonContainer>
      </ContentHeader>
      <Grid container>
        <Grid item xs={12}>
          <CollectionCard collection={collection} />
        </Grid>
        <Grid item xs={12}>
          <PostsGrid
            collectionId={collection.id}
            orderBy="rank"
            allowRanking={collection.canEdit}
          />
        </Grid>
      </Grid>
    </>
  );
};
