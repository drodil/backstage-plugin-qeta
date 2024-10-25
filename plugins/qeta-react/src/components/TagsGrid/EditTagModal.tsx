import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Backdrop,
  Box,
  Button,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useStyles, useTranslation } from '../../hooks';

export const EditTagModal = (props: {
  tag: TagResponse;
  open: boolean;
  onClose: () => void;
}) => {
  const { tag, open, onClose } = props;
  const [description, setDescription] = React.useState(tag.description);
  const styles = useStyles();
  const { t } = useTranslation();
  const [error, setError] = React.useState(false);
  const qetaApi = useApi(qetaApiRef);

  const handleUpdate = () => {
    qetaApi
      .updateTag(tag.tag, description)
      .then(ret => {
        if (ret) {
          onClose();
          return;
        }
        setError(true);
      })
      .catch(() => {
        setError(true);
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="qetaEditTagModal"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box className={`qetaEditTagContent ${styles.deleteModal}`}>
        {error && (
          <Alert severity="error">{t('editTagModal.errorPosting')}</Alert>
        )}
        <Typography
          id="modal-modal-title"
          className="qetaEditTagModalTitle"
          variant="h6"
          component="h2"
        >
          {t('editTagModal.title', { tag: tag.tag })}
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              label={t('editTagModal.description')}
              multiline
              minRows={10}
              style={{ width: '100%' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          onClick={handleUpdate}
          className="qetaEditTagModalSaveBtn"
          color="secondary"
        >
          {t('editTagModal.saveButton')}
        </Button>
        <Button onClick={onClose} className="qetaEditTagModalCancelBtn">
          {t('editTagModal.cancelButton')}
        </Button>
      </Box>
    </Modal>
  );
};
