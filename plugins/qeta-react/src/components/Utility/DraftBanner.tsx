import { Alert } from '@backstage/ui';
import { RiDraftLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const DraftBanner = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Alert
      status="warning"
      icon={<RiDraftLine size={16} />}
      description={t('questionPage.draftStatus')}
    />
  );
};
