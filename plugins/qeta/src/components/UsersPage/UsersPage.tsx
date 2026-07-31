import {
  qetaTranslationRef,
  UsersContainer,
} from '@drodil/backstage-plugin-qeta-react';
import { Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <Header title={t('usersPage.title')} />
      <UsersContainer />
    </>
  );
};
