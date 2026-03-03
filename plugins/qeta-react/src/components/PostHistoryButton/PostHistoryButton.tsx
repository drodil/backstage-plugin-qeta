import { useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useHistoryEnabled } from '../../hooks';
import { PostHistory } from '../PostHistory';

export const PostHistoryButton = (props: {
  post: PostResponse;
  onRestore?: () => void;
}) => {
  const { post, onRestore } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const historyEnabled = useHistoryEnabled(post.type);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleRestore = useCallback(() => {
    setHistoryOpen(false);
    onRestore?.();
  }, [onRestore]);

  const isActive = post.status === 'active';
  const enabled = historyEnabled && isActive;

  const getTooltipTitle = () => {
    if (!historyEnabled) {
      return t('postHistory.disabledTooltip');
    }
    if (!isActive) {
      return t('postHistory.notActiveTooltip');
    }
    return t('postHistory.buttonLabel');
  };

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryIcon />}
            disabled={!enabled}
            onClick={() => setHistoryOpen(true)}
          >
            {t('postHistory.buttonLabel')}
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('postHistory.title')}</DialogTitle>
        <DialogContent>
          <PostHistory postId={post.id} onRestore={handleRestore} />
        </DialogContent>
      </Dialog>
    </>
  );
};
