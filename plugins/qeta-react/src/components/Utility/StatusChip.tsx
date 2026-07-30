import { Tag } from '@backstage/ui';
import { RiDeleteBinLine, RiDraftLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './StatusChip.module.css';

interface StatusChipProps {
  status?: string;
  className?: string;
}

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  if (status === 'draft') {
    return (
      <Tag
        size="small"
        icon={<RiDraftLine size={14} />}
        className={`${styles.statusChip} ${styles.draft} ${className || ''}`}
      >
        {t('common.draft')}
      </Tag>
    );
  }
  if (status === 'deleted') {
    return (
      <Tag
        size="small"
        icon={<RiDeleteBinLine size={14} />}
        className={`${styles.statusChip} ${styles.deleted} ${className || ''}`}
      >
        {t('common.deleted')}
      </Tag>
    );
  }
  return null;
};
