import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { InfoCard } from '@backstage/core-components';
import { Button, CardContent, CardMedia, Grid } from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import React from 'react';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import DeleteIcon from '@material-ui/icons/Delete';
import { DeleteModal } from '../DeleteModal';
import EditIcon from '@material-ui/icons/Edit';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionEditRouteRef } from '../../routes';
import { useStyles, useTranslation } from '../../hooks';

export const CollectionCard = (props: { collection: Collection }) => {
  const { collection } = props;
  const styles = useStyles();
  const editCollectionRoute = useRouteRef(collectionEditRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const { t } = useTranslation();
  return (
    <InfoCard>
      {collection.headerImage && (
        <CardMedia
          component="img"
          height="200"
          src={collection.headerImage}
          alt={collection.title}
        />
      )}
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            {collection.description && (
              <MarkdownRenderer content={collection.description} />
            )}
          </Grid>
          <Grid item xs={12}>
            <TagsAndEntities entity={collection} />
          </Grid>
          <Grid container item xs={12}>
            {collection.canDelete && (
              <Grid item>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={handleDeleteModalOpen}
                  className={`${styles.marginRight} qetaCollectionCardDeleteBtn`}
                  startIcon={<DeleteIcon />}
                >
                  {t('deleteModal.deleteButton')}
                </Button>
                <DeleteModal
                  open={deleteModalOpen}
                  onClose={handleDeleteModalClose}
                  entity={collection}
                />
              </Grid>
            )}
            {collection.canEdit && (
              <Grid item>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  href={editCollectionRoute({
                    id: collection.id.toString(10),
                  })}
                  className="qetaCollectionCardEditBtn"
                >
                  {t('questionPage.editButton')}
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </InfoCard>
  );
};
