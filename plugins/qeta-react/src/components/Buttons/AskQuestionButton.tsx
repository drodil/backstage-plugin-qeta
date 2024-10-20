import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreatePostPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';
import { useTranslation } from '../../utils/hooks';

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
    <RequirePermission permission={qetaCreatePostPermission} errorPage={<></>}>
      <LinkButton
        variant="contained"
        to={entity || tags ? `${askRoute()}?${params.toString()}` : askRoute()}
        color="primary"
        className="qetaAskQuestionBtn"
        startIcon={<HelpOutline />}
      >
        {t('askQuestionButton.title')}
      </LinkButton>
    </RequirePermission>
  );
};
