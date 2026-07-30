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
import { RiForbidLine } from '@remixicon/react';
import { useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const ObsoleteModal = (props: {
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

  const handleMarkObsolete = () => {
    qetaApi
      .reviewPost(post.id, 'obsolete', comment)
      .catch(_ => setError(true))
      .then(ret => {
        if (ret) {
          onClose();
          onConfirm?.();
          alertApi.post({
            message: t('obsoleteModal.success', {}),
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
      className="qetaObsoleteModal"
    >
      <DialogHeader className="qetaObsoleteModalTitle">
        {t('obsoleteModal.title', {})}
      </DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          {error && (
            <Alert
              status="danger"
              icon
              description={t('obsoleteModal.errorMarking', {})}
            />
          )}
          <Text variant="body-small">{t('obsoleteModal.description', {})}</Text>
          <TextAreaField
            label={t('obsoleteModal.comment', {})}
            id="comment"
            rows={4}
            value={comment}
            onChange={value => setComment(value)}
          />
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={handleMarkObsolete}
          className="qetaObsoleteModalConfirmBtn"
          iconStart={<RiForbidLine />}
          variant="primary"
        >
          {t('obsoleteModal.confirmButton', {})}
        </Button>
        <Button
          onClick={onClose}
          className="qetaObsoleteModalCancelBtn"
          variant="secondary"
          slot="close"
        >
          {t('obsoleteModal.cancelButton', {})}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
