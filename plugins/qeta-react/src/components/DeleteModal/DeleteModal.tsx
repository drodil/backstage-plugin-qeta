import {
  AnswerResponse,
  CollectionResponse,
  PostResponse,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Backdrop, Button, Modal, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Delete from '@material-ui/icons/Delete';
import { useState } from 'react';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ModalContent } from '../Utility/ModalContent';
import {
  articlesRouteRef,
  collectionsRouteRef,
  questionsRouteRef,
  tagsRouteRef,
} from '../../routes.ts';

export const DeleteModal = (props: {
  entity: PostResponse | AnswerResponse | CollectionResponse | TagResponse;
  open: boolean;
  onClose: () => void;
  question?: PostResponse;
  onDelete?: (
    entity: PostResponse | AnswerResponse | CollectionResponse | TagResponse,
  ) => void;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);
  const navigate = useNavigate();
  const collectionsRoute = useRouteRef(collectionsRouteRef);
  const tagsRoute = useRouteRef(tagsRouteRef);
  const questionsRoute = useRouteRef(questionsRouteRef);
  const articlesRoute = useRouteRef(articlesRouteRef);
  const { entity, open, question, onClose, onDelete } = props;
  const [error, setError] = useState(false);
  const { t } = useTranslationRef(qetaTranslationRef);
  const isQuestion = 'title' in entity;
  const isCollection = 'owner' in entity;
  const isTag = 'tag' in entity;

  const getTitle = () => {
    if (isCollection) {
      return t('deleteModal.title.collection');
    }
    if (isTag) {
      return t('deleteModal.title.tag');
    }
    if (isQuestion) {
      return t('deleteModal.title.question');
    }
    return t('deleteModal.title.answer');
  };

  // eslint-disable-next-line no-nested-ternary
  const title = getTitle();

  const handleDelete = () => {
    if (isCollection) {
      qetaApi
        .deleteCollection(entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            onDelete?.(entity);
            alertApi.post({
              message: t('deleteModal.collectionDeleted'),
              severity: 'success',
              display: 'transient',
            });
            navigate(collectionsRoute());
          } else {
            setError(true);
          }
        });
    } else if (isTag) {
      qetaApi
        .deleteTag(entity.id)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            onDelete?.(entity);
            alertApi.post({
              message: t('deleteModal.tagDeleted'),
              severity: 'success',
              display: 'transient',
            });
            navigate(tagsRoute());
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
            onDelete?.(entity);
            alertApi.post({
              message:
                entity.type === 'question'
                  ? t('deleteModal.questionDeleted')
                  : t('deleteModal.articleDeleted'),
              severity: 'success',
              display: 'transient',
            });
            navigate(
              entity.type === 'question' ? questionsRoute() : articlesRoute(),
            );
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
            onDelete?.(entity);
            alertApi.post({
              message: t('deleteModal.answerDeleted'),
              severity: 'success',
              display: 'transient',
            });
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
      <ModalContent>
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
      </ModalContent>
    </Modal>
  );
};
