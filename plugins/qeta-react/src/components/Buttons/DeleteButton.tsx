import { Button, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  AnswerResponse,
  CollectionResponse,
  isPost,
  PostResponse,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { DeleteModal } from '../Modals';
import { RiDeleteBinLine } from '@remixicon/react';
import { useState } from 'react';

export const DeleteButton = (props: {
  entity: PostResponse | AnswerResponse | CollectionResponse | TagResponse;
  compact?: boolean;
}) => {
  const { entity, compact } = props;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const { t } = useTranslationRef(qetaTranslationRef);
  let tooltip: string = t('common.delete');
  if (isPost(entity) && entity.status === 'deleted') {
    tooltip = t('common.deletePermanently');
  }

  if (!entity.canDelete) {
    return null;
  }

  if (compact) {
    return (
      <>
        <TooltipTrigger>
          <ButtonIcon
            variant="tertiary"
            size="small"
            onClick={handleDeleteModalOpen}
            icon={<RiDeleteBinLine size={16} />}
          />
          <Tooltip>{tooltip}</Tooltip>
        </TooltipTrigger>
        <DeleteModal
          open={deleteModalOpen}
          onClose={handleDeleteModalClose}
          entity={entity}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        destructive
        onClick={handleDeleteModalOpen}
        iconStart={<RiDeleteBinLine size={16} />}
      >
        {tooltip}
      </Button>
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        entity={entity}
      />
    </>
  );
};
