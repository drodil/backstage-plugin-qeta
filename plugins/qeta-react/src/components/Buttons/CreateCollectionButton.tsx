import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionCreateRouteRef } from '../../routes';
import { useStyles, useTranslation } from '../../utils/hooks';

export const CreateCollectionButton = () => {
  const createRoute = useRouteRef(collectionCreateRouteRef);
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <RequirePermission permission={qetaCreatePostPermission} errorPage={<></>}>
      <LinkButton
        variant="contained"
        to={createRoute()}
        color="primary"
        className={`${styles.marginLeft} qetaCreateCollectionBtn`}
        startIcon={<PlayListAddIcon />}
      >
        {t('createCollectionButton.title')}
      </LinkButton>
    </RequirePermission>
  );
};
