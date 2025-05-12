import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useIdentityApi } from './useIdentityApi';
import { useEffect, useMemo, useState } from 'react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { qetaModeratePermission } from '@drodil/backstage-plugin-qeta-common';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

export const useIsModerator = () => {
  const configApi = useApi(configApiRef);
  const permissionApi = useApi(permissionApiRef);
  const [isModerator, setIsModerator] = useState(false);
  const moderators = useMemo(
    () => configApi.getOptionalStringArray('qeta.moderators') ?? [],
    [configApi],
  );
  const usePermissions = useMemo(
    () => configApi.getOptionalBoolean('qeta.permissions') ?? false,
    [configApi],
  );

  const { value: user } = useIdentityApi(api => api.getBackstageIdentity(), []);

  useEffect(() => {
    if (usePermissions) {
      permissionApi
        .authorize({ permission: qetaModeratePermission })
        .then(resp => {
          setIsModerator(resp.result === AuthorizeResult.ALLOW);
        });
      return;
    }

    const ownership: string[] = user?.ownershipEntityRefs ?? [];
    if (user?.userEntityRef && !ownership.includes(user.userEntityRef)) {
      ownership.push(user.userEntityRef);
    }
    setIsModerator(moderators.some((m: string) => ownership.includes(m)));
  }, [moderators, permissionApi, usePermissions, user]);

  return { isModerator };
};
