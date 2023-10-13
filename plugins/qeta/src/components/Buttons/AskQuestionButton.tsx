import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreateQuestionPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { askRouteRef } from '../../routes';

export const AskQuestionButton = (props: { entity?: string }) => {
  const params = new URLSearchParams(window.location.search);
  const askRoute = useRouteRef(askRouteRef);
  if (params.get('entity')) {
    return null;
  }
  return (
    <RequirePermission
      permission={qetaCreateQuestionPermission}
      errorPage={<></>}
    >
      <LinkButton
        variant="contained"
        to={props.entity ? `${askRoute()}?entity=${props.entity}` : askRoute()}
        color="primary"
        className="qetaAskQuestionBtn"
        startIcon={<HelpOutline />}
      >
        Ask question
      </LinkButton>
    </RequirePermission>
  );
};
