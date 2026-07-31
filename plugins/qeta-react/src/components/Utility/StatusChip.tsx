import { RiDeleteBinLine, RiDraftLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Chip } from './Chip.tsx';
import styles from './StatusChip.module.css';

interface StatusChipProps {
  status?: string;
  className?: string;
}

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  if (status === 'draft') {
    return (
      <Chip
        size="small"
        icon={<RiDraftLine size={14} />}
        className={`${styles.statusChip} ${styles.draft} ${className || ''}`}
      >
        {t('common.draft')}
      </Chip>
    );
  }
  if (status === 'deleted') {
    return (
      <Chip
        size="small"
        icon={<RiDeleteBinLine size={14} />}
        className={`${styles.statusChip} ${styles.deleted} ${className || ''}`}
      >
        {t('common.deleted')}
      </Chip>
    );
  }
  return null;
};
