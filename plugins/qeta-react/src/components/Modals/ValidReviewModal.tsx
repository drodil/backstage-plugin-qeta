import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Backdrop,
  Button,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CheckIcon from '@material-ui/icons/Check';
import { useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ModalContent } from '../Utility/ModalContent';

export const ValidReviewModal = (props: {
  post: PostResponse;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);
  const { post, open, onClose, onConfirm } = props;
  const [error, setError] = useState(false);
  const [comment, setComment] = useState<undefined | string>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);

  const handleMarkValid = () => {
    qetaApi
      .reviewPost(post.id, 'valid', comment)
      .catch(_ => setError(true))
      .then(ret => {
        if (ret) {
          onClose();
          onConfirm?.();
          alertApi.post({
            message: t('validReviewModal.success', {}),
            severity: 'success',
            display: 'transient',
          });
        } else {
          setError(true);
        }
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="qetaValidReviewModal"
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
          <Alert severity="error">
            {t('validReviewModal.errorMarking', {})}
          </Alert>
        )}
        <Typography
          id="modal-modal-title"
          className="qetaValidReviewModalTitle"
          variant="h6"
          component="h2"
        >
          {t('validReviewModal.title', {})}
        </Typography>
        <Typography variant="body2" style={{ marginTop: 8 }}>
          {t('validReviewModal.description', {})}
        </Typography>
        <TextField
          variant="outlined"
          multiline
          style={{ marginTop: 16 }}
          minRows={4}
          label={t('validReviewModal.comment', {})}
          id="comment"
          fullWidth
          value={comment}
          InputLabelProps={{ shrink: true }}
          onChange={e => {
            setComment(e.target.value);
          }}
        />
        <Button
          onClick={handleMarkValid}
          className="qetaValidReviewModalConfirmBtn"
          startIcon={<CheckIcon />}
          color="primary"
        >
          {t('validReviewModal.confirmButton', {})}
        </Button>
        <Button onClick={onClose} className="qetaValidReviewModalCancelBtn">
          {t('validReviewModal.cancelButton', {})}
        </Button>
      </ModalContent>
    </Modal>
  );
};
