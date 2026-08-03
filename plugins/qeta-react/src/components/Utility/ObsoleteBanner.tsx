import { Alert } from '@backstage/ui';
import { RiAlertLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const ObsoleteBanner = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Alert
      status="warning"
      icon={<RiAlertLine size={16} />}
      description={t('questionPage.obsoleteStatus')}
    />
  );
};
