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
  home?: boolean;
}) => {
  const { entity, home, tag } = props;
  const askRoute = useRouteRef(askRouteRef);

  const params = new URLSearchParams();
  if (entity) {
    params.set('entity', entity);
  }
  if (home) {
    params.set('home', home ? 'true' : 'false');
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
        to={
          params.values.length > 0
            ? `${askRoute()}?${params.toString()}`
            : askRoute()
        }
        color="primary"
        className="qetaAskQuestionBtn"
        startIcon={<HelpOutline />}
      >
        Ask question
      </LinkButton>
    </RequirePermission>
  );
};
