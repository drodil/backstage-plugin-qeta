import { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonIcon,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  List,
  ListRow,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiArrowGoBackLine, RiEyeLine } from '@remixicon/react';
import { PostRevision } from '@drodil/backstage-plugin-qeta-common';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { qetaApiRef } from '../../api';
import { useQetaApi } from '../../hooks';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { UserLink } from '../Links';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import styles from './PostHistory.module.css';

export const PostHistory = (props: {
  postId: number;
  onRestore?: () => void;
}) => {
  const { postId, onRestore } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);

  const [viewRevision, setViewRevision] = useState<PostRevision | null>(null);
  const [restoreRevision, setRestoreRevision] = useState<PostRevision | null>(
    null,
  );
  const [restoring, setRestoring] = useState(false);

  const {
    value: revisionsData,
    loading,
    error,
    retry,
  } = useQetaApi(api => api.getPostRevisions(postId, { limit: 50 }), [postId]);

  const handleRestore = useCallback(async () => {
    if (!restoreRevision) return;
    setRestoring(true);
    try {
      await qetaApi.restorePostRevision(postId, restoreRevision.id);
      alertApi.post({
        message: t('postHistory.restoreSuccess'),
        severity: 'success',
        display: 'transient',
      });
      setRestoreRevision(null);
      retry();
      onRestore?.();
    } catch {
      alertApi.post({
        message: t('postHistory.restoreError'),
        severity: 'error',
        display: 'transient',
      });
    } finally {
      setRestoring(false);
    }
  }, [restoreRevision, qetaApi, postId, alertApi, t, retry, onRestore]);

  if (loading) {
    return <LoadingGrid />;
  }

  if (error) {
    return <Alert status="danger" title={t('postHistory.errorLoading')} />;
  }

  const revisions = revisionsData?.revisions ?? [];

  if (revisions.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Text variant="body-medium" color="secondary">
          {t('postHistory.noRevisions')}
        </Text>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      {revisions.map(revision => (
        <List key={revision.id}>
          <ListRow
            className={styles.listRow}
            customActions={
              <Box className={styles.rowActions}>
                <TooltipTrigger>
                  <ButtonIcon
                    aria-label={t('postHistory.viewRevision')}
                    size="small"
                    variant="tertiary"
                    icon={<RiEyeLine size={16} />}
                    onPress={() => setViewRevision(revision)}
                  />
                  <Tooltip>{t('postHistory.viewRevision')}</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <ButtonIcon
                    aria-label={t('postHistory.restoreRevision')}
                    size="small"
                    variant="tertiary"
                    icon={<RiArrowGoBackLine size={16} />}
                    onPress={() => setRestoreRevision(revision)}
                  />
                  <Tooltip>{t('postHistory.restoreRevision')}</Tooltip>
                </TooltipTrigger>
              </Box>
            }
          >
            <div className={styles.rowContent}>
              <Text variant="body-medium" weight="bold" as="div" truncate>
                {revision.title}
              </Text>
              <Text variant="body-small" color="secondary" as="div">
                <RelativeTimeWithTooltip value={revision.created} />
                {' · '}
                {t('postHistory.revisionBy')}{' '}
                <UserLink entityRef={revision.createdBy} />
              </Text>
            </div>
          </ListRow>
        </List>
      ))}

      {/* View revision dialog */}
      <Dialog
        isOpen={viewRevision !== null}
        isDismissable
        onOpenChange={isOpenState => {
          if (!isOpenState) setViewRevision(null);
        }}
      >
        {viewRevision && (
          <>
            <DialogHeader>{viewRevision.title}</DialogHeader>
            <DialogBody className={styles.revisionContent}>
              <Text
                variant="body-x-small"
                color="secondary"
                as="div"
                className={styles.revisionMeta}
              >
                <RelativeTimeWithTooltip value={viewRevision.created} />
                {' · '}
                {t('postHistory.revisionBy')}{' '}
                <UserLink entityRef={viewRevision.createdBy} />
              </Text>
              <MarkdownRenderer content={viewRevision.content} />
            </DialogBody>
            <DialogFooter>
              <Button
                variant="primary"
                iconStart={<RiArrowGoBackLine />}
                onClick={() => {
                  setViewRevision(null);
                  setRestoreRevision(viewRevision);
                }}
              >
                {t('postHistory.restoreRevision')}
              </Button>
              <Button variant="secondary" onClick={() => setViewRevision(null)}>
                {t('postHistory.closeButton')}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Restore confirmation dialog */}
      <Dialog
        isOpen={restoreRevision !== null}
        isDismissable
        onOpenChange={isOpenState => {
          if (!isOpenState) setRestoreRevision(null);
        }}
      >
        <DialogHeader>{t('postHistory.restoreConfirmTitle')}</DialogHeader>
        <DialogBody>
          <Text variant="body-medium">
            {t('postHistory.restoreConfirmDescription')}
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="primary"
            isDisabled={restoring}
            onClick={handleRestore}
          >
            {t('postHistory.restoreConfirmButton')}
          </Button>
          <Button
            variant="secondary"
            isDisabled={restoring}
            onClick={() => setRestoreRevision(null)}
          >
            {t('postHistory.cancelButton')}
          </Button>
        </DialogFooter>
      </Dialog>
    </Box>
  );
};
