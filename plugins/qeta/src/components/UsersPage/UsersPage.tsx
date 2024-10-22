import React from 'react';
import { UsersGrid, useTranslation } from '@drodil/backstage-plugin-qeta-react';
import { ContentHeader } from '@backstage/core-components';

export const UsersPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <ContentHeader title={t('usersPage.title')} />
      <UsersGrid />
    </>
  );
};
