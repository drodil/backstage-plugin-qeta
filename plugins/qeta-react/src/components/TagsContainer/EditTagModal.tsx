import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
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
import { useEffect, useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { compact } from 'lodash';

export const EditTagModal = (props: {
  tag: TagResponse;
  open: boolean;
  onClose: () => void;
  isModerator?: boolean;
}) => {
  const { tag, open, onClose, isModerator } = props;
  const [description, setDescription] = useState(tag.description);
  const [experts, setExperts] = useState<Entity[]>([]);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [error, setError] = useState(false);
  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const alertApi = useApi(alertApiRef);

  useEffect(() => {
    if (!isModerator || !tag.experts || tag.experts.length === 0) {
      return;
    }
    catalogApi
      .getEntitiesByRefs({ entityRefs: tag.experts })
      .catch(e =>
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        }),
      )
      .then(resp => {
        if (resp) {
          setExperts(compact(resp.items));
        }
      });
  }, [alertApi, catalogApi, isModerator, tag.experts]);

  const handleUpdate = () => {
    qetaApi
      .updateTag(
        tag.id,
        description,
        isModerator ? experts.map(stringifyEntityRef) : undefined,
      )
      .then(ret => {
        if (ret) {
          onClose();
          return;
        }
        setError(true);
      })
      .catch(e => {
        setError(true);
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        });
      });
  };

  return (
    <Dialog
      isOpen={open}
      isDismissable
      onOpenChange={isOpenState => {
        if (!isOpenState) onClose();
      }}
      className="qetaEditTagModal"
    >
      <DialogHeader className="qetaEditTagModalTitle">
        {t('editTagModal.title', { tag: tag.tag })}
      </DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          {error && (
            <Alert
              status="danger"
              icon
              description={t('editTagModal.errorPosting')}
            />
          )}
          <TextAreaField
            id="description"
            label={t('editTagModal.description')}
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
          onClick={handleUpdate}
          className="qetaEditTagModalSaveBtn"
          variant="primary"
        >
          {t('editTagModal.saveButton')}
        </Button>
        <Button
          onClick={onClose}
          className="qetaEditTagModalCancelBtn"
          variant="secondary"
          slot="close"
        >
          {t('editTagModal.cancelButton')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
