import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import RestoreIcon from '@material-ui/icons/Restore';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { PostRevision } from '@drodil/backstage-plugin-qeta-common';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { qetaApiRef } from '../../api';
import { useQetaApi } from '../../hooks';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { UserLink } from '../Links';
import { Progress, WarningPanel } from '@backstage/core-components';

const useStyles = makeStyles(
  theme => ({
    root: {
      width: '100%',
    },
    listItem: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    revisionContent: {
      maxHeight: '60vh',
      overflowY: 'auto',
      padding: theme.spacing(2),
    },
    revisionTitle: {
      marginBottom: theme.spacing(1),
    },
    emptyState: {
      padding: theme.spacing(4),
      textAlign: 'center',
    },
  }),
  { name: 'QetaPostHistory' },
);

export const PostHistory = (props: {
  postId: number;
  onRestore?: () => void;
}) => {
  const { postId, onRestore } = props;
  const classes = useStyles();
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
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title={t('postHistory.errorLoading')} />
    );
  }

  const revisions = revisionsData?.revisions ?? [];

  if (revisions.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1" color="textSecondary">
          {t('postHistory.noRevisions')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <List>
        {revisions.map(revision => (
          <ListItem key={revision.id} className={classes.listItem}>
            <ListItemText
              primary={revision.title}
              secondary={
                <>
                  <RelativeTimeWithTooltip value={revision.created} />
                  {' · '}
                  {t('postHistory.revisionBy')}{' '}
                  <UserLink entityRef={revision.createdBy} />
                </>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title={t('postHistory.viewRevision')}>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={t('postHistory.viewRevision')}
                  onClick={() => setViewRevision(revision)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('postHistory.restoreRevision')}>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={t('postHistory.restoreRevision')}
                  onClick={() => setRestoreRevision(revision)}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* View revision dialog */}
      <Dialog
        open={viewRevision !== null}
        onClose={() => setViewRevision(null)}
        maxWidth="md"
        fullWidth
      >
        {viewRevision && (
          <>
            <DialogTitle>{viewRevision.title}</DialogTitle>
            <DialogContent className={classes.revisionContent}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                <RelativeTimeWithTooltip value={viewRevision.created} />
                {' · '}
                {t('postHistory.revisionBy')}{' '}
                <UserLink entityRef={viewRevision.createdBy} />
              </Typography>
              <MarkdownRenderer content={viewRevision.content} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewRevision(null)}>
                {t('postHistory.closeButton')}
              </Button>
              <Button
                color="primary"
                startIcon={<RestoreIcon />}
                onClick={() => {
                  setViewRevision(null);
                  setRestoreRevision(viewRevision);
                }}
              >
                {t('postHistory.restoreRevision')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Restore confirmation dialog */}
      <Dialog
        open={restoreRevision !== null}
        onClose={() => setRestoreRevision(null)}
      >
        <DialogTitle>{t('postHistory.restoreConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('postHistory.restoreConfirmDescription')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreRevision(null)} disabled={restoring}>
            {t('postHistory.cancelButton')}
          </Button>
          <Button color="primary" onClick={handleRestore} disabled={restoring}>
            {t('postHistory.restoreConfirmButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
