import { Alert } from '@backstage/ui';
import { RiDraftLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const DeletedBanner = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Alert
      status="danger"
      icon={<RiDraftLine size={16} />}
      description={t('questionPage.deletedStatus')}
    />
  );
};
