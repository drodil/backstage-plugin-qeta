import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation';

export const useTranslation = () => {
  return useTranslationRef(qetaTranslationRef);
};
