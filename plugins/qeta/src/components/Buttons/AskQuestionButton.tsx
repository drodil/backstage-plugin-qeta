import HelpOutline from '@material-ui/icons/HelpOutline';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreateQuestionPermission } from '@drodil/backstage-plugin-qeta-common';
import { LinkButton } from '@backstage/core-components';

export const AskQuestionButton = () => {
  return (
    <RequirePermission
      permission={qetaCreateQuestionPermission}
      errorPage={<></>}
    >
      <LinkButton
        variant="contained"
        href="/qeta/ask"
        color="primary"
        startIcon={<HelpOutline />}
      >
        Ask question
      </LinkButton>
    </RequirePermission>
  );
};
