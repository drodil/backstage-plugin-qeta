import { useParams } from 'react-router-dom';
import {
  CollectionFollowButton,
  ContentHeader,
  DeleteModal,
  collectionEditRouteRef,
  qetaTranslationRef,
  useQetaApi,
  PostsContainer,
} from '@drodil/backstage-plugin-qeta-react';
import { Skeleton } from '@material-ui/lab';
import { WarningPanel } from '@backstage/core-components';
import { Button, Grid, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import { useNavigate } from 'react-router-dom';
import { ContentHeaderCard } from '@drodil/backstage-plugin-qeta-react';
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
      <WarningPanel severity="error" title={t('questionPage.errorLoading', {})}>
        {error?.message}
      </WarningPanel>
    );
  }

  const title = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <PlaylistPlayIcon fontSize="large" style={{ marginRight: '8px' }} />
      <Typography variant="h5" component="h2">
        {collection.title}
      </Typography>
    </div>
  );

  return (
    <>
      <ContentHeader titleComponent={title}>
        <CollectionFollowButton collection={collection} />
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
            {t('templateList.editButton', {})}
          </Button>
        )}
        {collection.canDelete && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteModalOpen}
          >
            {t('templateList.deleteButton', {})}
          </Button>
        )}
      </ContentHeader>
      <Grid container>
        <Grid item xs={12}>
          <ContentHeaderCard
            description={collection.description}
            image={collection.headerImage}
            imageIcon={<PlaylistPlayIcon style={{ fontSize: 80 }} />}
            tagsAndEntities={{ entity: collection }}
            stats={[
              {
                label: t('common.postsLabel', {
                  count: collection.postsCount,
                  itemType: 'post',
                }),
                value: collection.postsCount,
                icon: <QuestionAnswerIcon fontSize="small" />,
              },
              {
                label: t('common.followersLabel', {
                  count: collection.followers,
                }),
                value: collection.followers,
                icon: <PeopleIcon fontSize="small" />,
              },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <PostsContainer
            collectionId={collection.id}
            orderBy="rank"
            allowRanking={collection.canEdit}
            defaultView="grid"
            prefix="collection-posts"
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
