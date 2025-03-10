import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import { Box } from '@material-ui/core';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';

export const AskQuestionButton = (props: {
  entity?: string;
  tags?: string[];
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tags } = props;
  const askRoute = useRouteRef(askRouteRef);
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
      <Box>
        <LinkButton
          variant="contained"
          size="small"
          to={
            entity || tags ? `${askRoute()}?${params.toString()}` : askRoute()
          }
          color="primary"
          startIcon={<HelpOutline />}
        >
          {t('askQuestionButton.title')}
        </LinkButton>
      </Box>
    </OptionalRequirePermission>
  );
};
