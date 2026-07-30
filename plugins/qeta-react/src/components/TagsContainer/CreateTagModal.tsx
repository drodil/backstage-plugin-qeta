import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  TextAreaField,
  TextField,
} from '@backstage/ui';
import { useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { EntitiesInput } from '../PostForm/EntitiesInput.tsx';
import { isValidTag } from '@drodil/backstage-plugin-qeta-common';

export const CreateTagModal = (props: {
  open: boolean;
  onClose: () => void;
  isModerator?: boolean;
}) => {
  const { open, onClose, isModerator } = props;
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [experts, setExperts] = useState<Entity[]>([]);
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);
  const [error, setError] = useState(false);
  const qetaApi = useApi(qetaApiRef);

  const handleCreate = () => {
    if (!isValidTag(tag)) {
      alertApi.post({
        message: t('createTagModal.invalidTagAlert'),
        severity: 'error',
        display: 'transient',
      });
      return;
    }

    qetaApi
      .createTag(
        tag,
        description,
        isModerator ? experts.map(stringifyEntityRef) : undefined,
      )
      .then(ret => {
        if (ret) {
          setTag('');
          setDescription('');
          setExperts([]);
          onClose();
          return;
        }
        setError(true);
      })
      .catch(e => {
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        });
        setError(true);
      });
  };

  return (
    <Dialog
      isOpen={open}
      isDismissable
      onOpenChange={isOpenState => {
        if (!isOpenState) onClose();
      }}
      className="qetaCreateTagModal"
    >
      <DialogHeader className="qetaCreateTagModalTitle">
        {t('createTagModal.title')}
      </DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          {error && (
            <Alert
              status="danger"
              icon
              description={t('createTagModal.errorPosting')}
            />
          )}
          <TextField
            isRequired
            id="tag"
            label={t('createTagModal.tagInput')}
            value={tag}
            onChange={value => setTag(value)}
          />
          <TextAreaField
            id="description"
            label={t('createTagModal.description')}
            rows={10}
            value={description ?? ''}
            onChange={value => setDescription(value)}
          />
          {isModerator && (
            <EntitiesInput
              value={experts}
              onChange={setExperts}
              maximum={null}
              kind={['User']}
              hideHelpText
              label={t('editTagModal.expertsLabel')}
              placeholder={t('editTagModal.expertsPlaceholder')}
            />
          )}
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={handleCreate}
          className="qetaCreateTagModalSaveBtn"
          variant="primary"
        >
          {t('createTagModal.createButton')}
        </Button>
        <Button
          onClick={onClose}
          className="qetaCreateTagModalCancelBtn"
          variant="secondary"
          slot="close"
        >
          {t('createTagModal.cancelButton')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
