import CreateIcon from '@material-ui/icons/Create';
import React from 'react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { writeRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import { Box } from '@material-ui/core';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

export const WriteArticleButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const writeRoute = useRouteRef(writeRouteRef);
  const { t } = useTranslation();

  const params = new URLSearchParams();
  if (entity) {
    params.set('entity', entity);
  }
  if (entityPage) {
    params.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    params.set('tags', tags.join(','));
  }

  return (
    <OptionalRequirePermission
      permission={qetaCreatePostPermission}
      errorPage={<></>}
    >
      <Box sx={{ marginLeft: 2 }}>
        <LinkButton
          size="small"
          variant="contained"
          to={
            entity || tags
              ? `${writeRoute()}?${params.toString()}`
              : writeRoute()
          }
          color="primary"
          startIcon={<CreateIcon />}
        >
          {t('writeArticleButton.title')}
        </LinkButton>
      </Box>
    </OptionalRequirePermission>
  );
};
