import { Collection, PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import AddCircle from '@material-ui/icons/AddCircle';
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useQetaApi } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ContentHeaderButton } from './ContentHeaderButton';

export const AddToCollectionButton = (props: { post: PostResponse }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);
  const { value: response, retry } = useQetaApi(api => {
    return api.getCollections({
      checkAccess: true,
      includeExperts: false,
      includePosts: true,
    });
  }, []);
  const [open, setOpen] = useState(false);
  const qetaApi = useApi(qetaApiRef);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (collection: Collection) => {
    if (collection.posts?.find(p => p.id === post.id)) {
      qetaApi
        .removePostFromCollection(collection.id, post.id)
        .then(() => {
          alertApi.post({
            message: t('addToCollectionButton.removed', {
              collection: collection.title,
            }),
            severity: 'success',
            display: 'transient',
          });
          retry();
        })
        .catch(e => {
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          });
        });
    } else {
      qetaApi
        .addPostToCollection(collection.id, post.id)
        .then(() => {
          alertApi.post({
            message: t('addToCollectionButton.added', {
              collection: collection.title,
            }),
            severity: 'success',
            display: 'transient',
          });
          retry();
        })
        .catch(e => {
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          });
        });
    }
  };

  if (post.status !== 'active') {
    return null;
  }

  const collections = (response?.collections ?? []).filter(c => c.canEdit);
  if (!collections.length) {
    return null;
  }

  return (
    <>
      <ContentHeaderButton onClick={handleClickOpen} icon={<PlayListAddIcon />}>
        {t('addToCollectionButton.title')}
      </ContentHeaderButton>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{t('addToCollectionButton.manage')}</DialogTitle>
        <DialogContent>
          <Grid container>
            {collections.map(collection => {
              const isInCollection = collection.posts?.find(
                p => p.id === post.id,
              );

              return (
                <Grid item key={collection.id}>
                  <Button
                    variant="outlined"
                    startIcon={
                      isInCollection ? <RemoveCircle /> : <AddCircle />
                    }
                    color={isInCollection ? 'secondary' : 'primary'}
                    onClick={() => handleClick(collection)}
                  >
                    {collection.title}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t('addToCollectionButton.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
