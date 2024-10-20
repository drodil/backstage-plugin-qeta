import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Backdrop, Box, Button, Modal, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Delete from '@material-ui/icons/Delete';
import React from 'react';
import { useBasePath, useStyles, useTranslation } from '../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef } from '@drodil/backstage-plugin-qeta-react';

export const DeleteModal = (props: {
  entity: PostResponse | AnswerResponse;
  open: boolean;
  onClose: () => void;
  question?: PostResponse;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const base_path = useBasePath();
  const navigate = useNavigate();
  const { entity, open, question, onClose } = props;
  const styles = useStyles();
  const [error, setError] = React.useState(false);
  const { t } = useTranslation();
  const isQuestion = 'title' in entity;

  const title = isQuestion
    ? t('deleteModal.title.question')
    : t('deleteModal.title.answer');

  const handleDelete = () => {
    if (isQuestion) {
      qetaApi
        .deletePost(entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            navigate(`${base_path}/qeta`);
          } else {
            setError(true);
          }
        });
    } else if (question) {
      qetaApi
        .deleteAnswer(question.id, entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            window.location.reload();
          } else {
            setError(true);
          }
        });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="qetaDeleteModal"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box className={`qetaDeleteModalContent ${styles.deleteModal}`}>
        {error && (
          <Alert severity="error">{t('deleteModal.errorDeleting')}</Alert>
        )}
        <Typography
          id="modal-modal-title"
          className="qetaDeleteModalTitle"
          variant="h6"
          component="h2"
        >
          {title}
        </Typography>
        <Button
          onClick={handleDelete}
          className="qetaDeleteModalDeleteBtn"
          startIcon={<Delete />}
          color="secondary"
        >
          {t('deleteModal.deleteButton')}
        </Button>
        <Button onClick={onClose} className="qetaDeleteModalCancelBtn">
          {t('deleteModal.cancelButton')}
        </Button>
      </Box>
    </Modal>
  );
};
