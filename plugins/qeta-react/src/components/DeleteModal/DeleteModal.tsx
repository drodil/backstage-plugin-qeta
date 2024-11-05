import {
  AnswerResponse,
  CollectionResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Delete from '@mui/icons-material/Delete';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef } from '../../api';
import { useBasePath } from '../../hooks/useBasePath';
import { useStyles, useTranslation } from '../../hooks';

export const DeleteModal = (props: {
  entity: PostResponse | AnswerResponse | CollectionResponse;
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
  const isCollection = 'owner' in entity;

  // eslint-disable-next-line no-nested-ternary
  const title = isCollection
    ? t('deleteModal.title.collection')
    : isQuestion
    ? t('deleteModal.title.question')
    : t('deleteModal.title.answer');

  const handleDelete = () => {
    if (isCollection) {
      qetaApi
        .deleteCollection(entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            navigate(`${base_path}/qeta`);
          } else {
            setError(true);
          }
        });
    } else if (isQuestion) {
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
      slots={{ backdrop: Backdrop }}
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
