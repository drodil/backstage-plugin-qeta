import PlayListAddIcon from '@mui/icons-material/PlaylistAdd';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionCreateRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import Box from '@mui/material/Box';

export const CreateCollectionButton = () => {
  const createRoute = useRouteRef(collectionCreateRouteRef);
  const { t } = useTranslation();

  return (
    <RequirePermission permission={qetaCreatePostPermission} errorPage={<></>}>
      <Box sx={{ marginLeft: 2 }}>
        <LinkButton
          size="small"
          variant="contained"
          to={createRoute()}
          color="primary"
          startIcon={<PlayListAddIcon />}
        >
          {t('createCollectionButton.title')}
        </LinkButton>
      </Box>
    </RequirePermission>
  );
};
