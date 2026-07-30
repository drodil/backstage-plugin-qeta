import {
  ContentHeader,
  qetaTranslationRef,
  UsersContainer,
} from '@drodil/backstage-plugin-qeta-react';
import { RiTeamLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('usersPage.title')}
        titleIcon={<RiTeamLine size={24} />}
      />
      <UsersContainer />
    </>
  );
};
