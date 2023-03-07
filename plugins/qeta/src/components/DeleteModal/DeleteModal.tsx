import { AnswerResponse, qetaApiRef, QuestionResponse } from '../../api';
import { Backdrop, Box, Modal, Typography } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import Delete from '@material-ui/icons/Delete';
import React from 'react';
import { useStyles } from '../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';

export const DeleteModal = (props: {
  entity: QuestionResponse | AnswerResponse;
  open: boolean;
  onClose: () => void;
  question?: QuestionResponse;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const navigate = useNavigate();
  const { entity, open, question, onClose } = props;
  const styles = useStyles();
  const [error, setError] = React.useState(false);
  const isQuestion = 'title' in entity;

  const title = isQuestion
    ? 'Are you sure you want to delete this question?'
    : 'Are you sure you want to delete this answer?';

  const handleDelete = () => {
    if (isQuestion) {
      qetaApi
        .deleteQuestion(entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            navigate(`/qeta`);
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
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box className={styles.deleteModal}>
        {error && <Alert severity="error">Failed to delete</Alert>}
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <LinkButton
          onClick={handleDelete}
          startIcon={<Delete />}
          color="secondary"
        >
          Delete
        </LinkButton>
        <LinkButton onClick={onClose}>Cancel</LinkButton>
      </Box>
    </Modal>
  );
};
