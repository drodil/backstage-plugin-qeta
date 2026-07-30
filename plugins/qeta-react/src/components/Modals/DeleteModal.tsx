import {
  AnswerResponse,
  CollectionResponse,
  PostResponse,
  selectByPostType,
  TagResponse,
  isPost,
  isCollection,
  isTag,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  TextAreaField,
} from '@backstage/ui';
import { RiDeleteBinLine } from '@remixicon/react';
import { useState } from 'react';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  articlesRouteRef,
  collectionsRouteRef,
  linksRouteRef,
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
  const linksRoute = useRouteRef(linksRouteRef);
  const { entity, open, question, onClose, onDelete } = props;
  const [error, setError] = useState(false);
  const [reason, setReason] = useState<undefined | string>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  const isPostEntity = isPost(entity);
  const isCollectionEntity = isCollection(entity);
  const isTagEntity = isTag(entity);

  const getTitle = () => {
    if (isCollectionEntity) {
      return t('deleteModal.title.collection');
    }
    if (isTagEntity) {
      return t('deleteModal.title.tag');
    }
    if (isPostEntity) {
      return t('deleteModal.title.question');
    }
    return t('deleteModal.title.answer');
  };

  // eslint-disable-next-line no-nested-ternary
  const title = getTitle();

  const handleDelete = () => {
    if (isCollectionEntity) {
      qetaApi
        .deleteCollection(entity.id, reason)
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
    } else if (isTagEntity) {
      qetaApi
        .deleteTag(entity.id, reason)
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
    } else if (isPostEntity) {
      qetaApi
        .deletePost(entity.id, reason)
        .catch(_ => setError(true))
        .then(ret => {
          if (ret) {
            onClose();
            onDelete?.(entity);
            alertApi.post({
              message: selectByPostType(
                (entity as PostResponse).type,
                t('deleteModal.questionDeleted'),
                t('deleteModal.articleDeleted'),
                t('deleteModal.linkDeleted'),
              ),
              severity: 'success',
              display: 'transient',
            });
            navigate(
              selectByPostType(
                (entity as PostResponse).type,
                questionsRoute(),
                articlesRoute(),
                linksRoute(),
              ),
            );
          } else {
            setError(true);
          }
        });
    } else if (question) {
      qetaApi
        .deleteAnswer(question.id, entity.id, reason)
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
    <Dialog
      isOpen={open}
      isDismissable
      onOpenChange={isOpenState => {
        if (!isOpenState) onClose();
      }}
      className="qetaDeleteModal"
      data-testid="delete-modal"
    >
      <DialogHeader className="qetaDeleteModalTitle">{title}</DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          {error && (
            <Alert
              status="danger"
              icon
              description={t('deleteModal.errorDeleting')}
            />
          )}
          <TextAreaField
            label={t('deleteModal.reason')}
            id="reason"
            rows={4}
            value={reason}
            onChange={value => setReason(value)}
          />
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={handleDelete}
          className="qetaDeleteModalDeleteBtn"
          iconStart={<RiDeleteBinLine />}
          variant="primary"
          destructive
        >
          {t('deleteModal.deleteButton')}
        </Button>
        <Button
          onClick={onClose}
          className="qetaDeleteModalCancelBtn"
          variant="secondary"
          slot="close"
        >
          {t('deleteModal.cancelButton')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
