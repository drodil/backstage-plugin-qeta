import HelpOutline from '@material-ui/icons/HelpOutline';
import { Button } from '@material-ui/core';
import React from 'react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { qetaCreateQuestionPermission } from '@drodil/backstage-plugin-qeta-common';

export const AskQuestionButton = () => {
  return (
    <RequirePermission
      permission={qetaCreateQuestionPermission}
      errorPage={<></>}
    >
      <Button
        variant="contained"
        href="/qeta/ask"
        color="primary"
        startIcon={<HelpOutline />}
      >
        Ask question
      </Button>
    </RequirePermission>
  );
};
