import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreateQuestionPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '@drodil/backstage-plugin-qeta-react';

export const AskQuestionButton = (props: {
  entity?: string;
  tag?: string;
  entityPage?: boolean;
}) => {
  const { entity, entityPage, tag } = props;
  const askRoute = useRouteRef(askRouteRef);

  const params = new URLSearchParams();
  if (entity) {
    params.set('entity', entity);
  }
  if (entityPage) {
    params.set('entityPage', 'true');
  }
  if (tag) {
    params.set('tag', tag);
  }

  return (
    <RequirePermission
      permission={qetaCreateQuestionPermission}
      errorPage={<></>}
    >
      <LinkButton
        variant="contained"
        to={entity || tag ? `${askRoute()}?${params.toString()}` : askRoute()}
        color="primary"
        className="qetaAskQuestionBtn"
        startIcon={<HelpOutline />}
      >
        Ask question
      </LinkButton>
    </RequirePermission>
  );
};
