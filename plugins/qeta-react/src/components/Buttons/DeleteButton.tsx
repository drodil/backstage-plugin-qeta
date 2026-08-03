import { Button, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  AnswerResponse,
  CollectionResponse,
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
  const tooltip = t('common.delete');

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
            aria-label={tooltip}
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
