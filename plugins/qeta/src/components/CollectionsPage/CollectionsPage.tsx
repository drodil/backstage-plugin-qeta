import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  CollectionsGrid,
  CreateCollectionButton,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';

export const CollectionsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <ContentHeader title={t('collectionsPage.title')}>
        <CreateCollectionButton />
      </ContentHeader>
      <CollectionsGrid />
    </>
  );
};
