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
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useQetaApi } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const AddToCollectionButton = (props: { post: PostResponse }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { value: response, retry } = useQetaApi(api => {
    return api.getCollections({
      checkAccess: true,
      includeExperts: false,
      includePosts: false,
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
      qetaApi.removePostFromCollection(collection.id, post.id).then(() => {
        retry();
      });
    } else {
      qetaApi.addPostToCollection(collection.id, post.id).then(() => {
        retry();
      });
    }
  };

  const collections = (response?.collections ?? []).filter(c => c.canEdit);
  if (!collections.length) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClickOpen}
        startIcon={<PlayListAddIcon />}
      >
        {t('addToCollectionButton.title')}
      </Button>
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
