import {
  ContentHeader,
  qetaTranslationRef,
  UsersGrid,
} from '@drodil/backstage-plugin-qeta-react';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        title={t('usersPage.title')}
        titleIcon={<PeopleOutline fontSize="large" />}
      />
      <UsersGrid />
    </>
  );
};
