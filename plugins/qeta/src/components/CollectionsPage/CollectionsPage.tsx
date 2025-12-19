import { ContentHeader } from '@backstage/core-components';
import {
  ButtonContainer,
  CollectionsGrid,
  CreateCollectionButton,
  qetaTranslationRef,
  useCollectionsFollow,
} from '@drodil/backstage-plugin-qeta-react';
import { Typography } from '@material-ui/core';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const CollectionsPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const collections = useCollectionsFollow();

  return (
    <>
      <ContentHeader
        titleComponent={
          <Typography
            variant="h4"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <PlaylistPlayOutlined
              fontSize="large"
              style={{ marginRight: '8px' }}
            />
            {t('collectionsPage.title')}
          </Typography>
        }
      >
        <ButtonContainer>
          <CreateCollectionButton />
        </ButtonContainer>
      </ContentHeader>
      <CollectionsGrid />
    </>
  );
};
