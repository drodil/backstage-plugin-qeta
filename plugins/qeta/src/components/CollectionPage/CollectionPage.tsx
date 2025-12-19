import { useParams } from 'react-router-dom';
import {
  ButtonContainer,
  CollectionCard,
  CollectionFollowButton,
  DeleteModal,
  PostsGrid,
  collectionEditRouteRef,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { Skeleton } from '@material-ui/lab';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { Button, Grid, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';

export const CollectionPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();
  const editCollectionRoute = useRouteRef(collectionEditRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

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
          {collection.canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() =>
                editCollectionRoute &&
                navigate(
                  editCollectionRoute({
                    id: collection.id.toString(10),
                  }),
                )
              }
            >
              {t('templateList.editButton')}
            </Button>
          )}
          {collection.canDelete && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteModalOpen}
            >
              {t('templateList.deleteButton')}
            </Button>
          )}
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
      {collection.canDelete && (
        <DeleteModal
          open={deleteModalOpen}
          onClose={handleDeleteModalClose}
          entity={collection}
        />
      )}
    </>
  );
};
