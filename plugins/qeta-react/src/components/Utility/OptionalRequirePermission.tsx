import {
  RequirePermission,
  RequirePermissionProps,
} from '@backstage/plugin-permission-react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { isPermission } from '@backstage/plugin-permission-common';
import { qetaCreateTagPermission } from '@drodil/backstage-plugin-qeta-common';

export const OptionalRequirePermission = (props: RequirePermissionProps) => {
  const config = useApi(configApiRef);
  if (config.getOptionalBoolean('qeta.permissions') !== true) {
    if (isPermission(props.permission, qetaCreateTagPermission)) {
      return (
        <>
          {config.getOptionalBoolean('qeta.tags.allowCreation') ?? true
            ? props.children
            : null}
        </>
      );
    }
    return <>{props.children}</>;
  }

  return <RequirePermission {...props} />;
};
