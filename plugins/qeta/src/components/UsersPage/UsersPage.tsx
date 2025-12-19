import {
  qetaTranslationRef,
  UsersGrid,
} from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UsersPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <>
      <ContentHeader
        titleComponent={
          <Typography
            variant="h4"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <PeopleOutline fontSize="large" style={{ marginRight: '8px' }} />
            {t('usersPage.title')}
          </Typography>
        }
      />
      <UsersGrid />
    </>
  );
};
