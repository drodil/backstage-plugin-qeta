import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  Text,
  TextAreaField,
} from '@backstage/ui';
import { RiCheckLine } from '@remixicon/react';
import { useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

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
    <Dialog
      isOpen={open}
      isDismissable
      onOpenChange={isOpenState => {
        if (!isOpenState) onClose();
      }}
      className="qetaValidReviewModal"
    >
      <DialogHeader className="qetaValidReviewModalTitle">
        {t('validReviewModal.title', {})}
      </DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          {error && (
            <Alert
              status="danger"
              icon
              description={t('validReviewModal.errorMarking', {})}
            />
          )}
          <Text variant="body-small">
            {t('validReviewModal.description', {})}
          </Text>
          <TextAreaField
            label={t('validReviewModal.comment', {})}
            id="comment"
            rows={4}
            value={comment}
            onChange={value => setComment(value)}
          />
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={handleMarkValid}
          className="qetaValidReviewModalConfirmBtn"
          iconStart={<RiCheckLine />}
          variant="primary"
        >
          {t('validReviewModal.confirmButton', {})}
        </Button>
        <Button
          onClick={onClose}
          className="qetaValidReviewModalCancelBtn"
          variant="secondary"
          slot="close"
        >
          {t('validReviewModal.cancelButton', {})}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
