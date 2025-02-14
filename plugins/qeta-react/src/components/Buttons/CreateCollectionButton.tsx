import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';
import React from 'react';
import { qetaCreateCollectionPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionCreateRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

export const CreateCollectionButton = () => {
  const createRoute = useRouteRef(collectionCreateRouteRef);
  const { t } = useTranslation();

  return (
    <OptionalRequirePermission
      permission={qetaCreateCollectionPermission}
      errorPage={<></>}
    >
      <LinkButton
        size="small"
        variant="contained"
        to={createRoute()}
        color="primary"
        startIcon={<PlayListAddIcon />}
      >
        {t('createCollectionButton.title')}
      </LinkButton>
    </OptionalRequirePermission>
  );
};
