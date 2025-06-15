import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  Backdrop,
  Button,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ModalContent } from '../Utility/ModalContent';
import { EntitiesInput } from '../PostForm/EntitiesInput.tsx';
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

  useEffect(() => {
    if (!isModerator || !tag.experts || tag.experts.length === 0) {
      return;
    }
    catalogApi.getEntitiesByRefs({ entityRefs: tag.experts }).then(resp => {
      setExperts(compact(resp.items));
    });
  }, [catalogApi, isModerator, tag.experts]);

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
      .catch(() => {
        setError(true);
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="qetaEditTagModal"
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
          <Alert severity="error">{t('editTagModal.errorPosting')}</Alert>
        )}
        <Typography
          id="modal-modal-title"
          className="qetaEditTagModalTitle"
          variant="h6"
          component="h2"
          style={{ marginBottom: '1em' }}
        >
          {t('editTagModal.title', { tag: tag.tag })}
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              label={t('editTagModal.description')}
              multiline
              minRows={10}
              style={{ width: '100%' }}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </Grid>
          {isModerator && (
            <Grid item xs={12}>
              <EntitiesInput
                value={experts}
                onChange={setExperts}
                maximum={null}
                kind={['User']}
                hideHelpText
                label={t('editTagModal.expertsLabel')}
                placeholder={t('editTagModal.expertsPlaceholder')}
              />
            </Grid>
          )}
        </Grid>

        <Button
          onClick={handleUpdate}
          className="qetaEditTagModalSaveBtn"
          color="secondary"
        >
          {t('editTagModal.saveButton')}
        </Button>
        <Button onClick={onClose} className="qetaEditTagModalCancelBtn">
          {t('editTagModal.cancelButton')}
        </Button>
      </ModalContent>
    </Modal>
  );
};
