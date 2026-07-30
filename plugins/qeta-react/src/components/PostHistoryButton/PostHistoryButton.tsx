import { useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiHistoryLine } from '@remixicon/react';
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

  if (!historyEnabled) {
    return null;
  }

  const getTooltipTitle = () => {
    if (!isActive) {
      return t('postHistory.notActiveTooltip');
    }
    return t('postHistory.buttonLabel');
  };

  return (
    <>
      <TooltipTrigger>
        <Button
          variant="secondary"
          size="small"
          iconStart={<RiHistoryLine size={16} />}
          isDisabled={!isActive}
          onClick={() => setHistoryOpen(true)}
        >
          {t('postHistory.buttonLabel')}
        </Button>
        <Tooltip>{getTooltipTitle()}</Tooltip>
      </TooltipTrigger>

      <Dialog
        isOpen={historyOpen}
        isDismissable
        onOpenChange={isOpenState => {
          if (!isOpenState) setHistoryOpen(false);
        }}
      >
        <DialogHeader>{t('postHistory.title')}</DialogHeader>
        <DialogBody>
          <PostHistory postId={post.id} onRestore={handleRestore} />
        </DialogBody>
      </Dialog>
    </>
  );
};
