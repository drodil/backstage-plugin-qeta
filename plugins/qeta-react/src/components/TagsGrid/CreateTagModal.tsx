import {
  Backdrop,
  Button,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';
import { ModalContent } from '../Utility/ModalContent';

export const CreateTagModal = (props: {
  open: boolean;
  onClose: () => void;
}) => {
  const { open, onClose } = props;
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const qetaApi = useApi(qetaApiRef);

  const handleCreate = () => {
    qetaApi
      .createTag(tag, description)
      .then(ret => {
        if (ret) {
          setTag('');
          setDescription('');
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
      className="qetaCreateTagModal"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <ModalContent>
        {error && (
          <Alert severity="error">{t('createTagModal.errorPosting')}</Alert>
        )}
        <Typography
          id="modal-modal-title"
          className="qetaCreateTagModalTitle"
          variant="h6"
          component="h2"
          style={{ marginBottom: '1em' }}
        >
          {t('createTagModal.title')}
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              label={t('createTagModal.tagInput')}
              style={{ width: '100%' }}
              required
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              label={t('createTagModal.description')}
              multiline
              minRows={10}
              style={{ width: '100%' }}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          onClick={handleCreate}
          className="qetaCreateTagModalSaveBtn"
          color="secondary"
        >
          {t('createTagModal.createButton')}
        </Button>
        <Button onClick={onClose} className="qetaCreateTagModalCancelBtn">
          {t('createTagModal.cancelButton')}
        </Button>
      </ModalContent>
    </Modal>
  );
};
