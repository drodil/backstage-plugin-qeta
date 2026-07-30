import { Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiStarFill } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './ExpertIcon.module.css';

export const ExpertIcon = (props: { className?: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <TooltipTrigger>
      <span className={`${styles.icon} ${props.className ?? ''}`.trim()}>
        <RiStarFill size={12} />
      </span>
      <Tooltip>{t('common.tagExpert')}</Tooltip>
    </TooltipTrigger>
  );
};
