import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useMemo, useState } from 'react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { qetaReadPostReviewPermission } from '@drodil/backstage-plugin-qeta-common';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { useIsModerator } from './useIsModerator';

export const useCanReview = () => {
  const configApi = useApi(configApiRef);
  const permissionApi = useApi(permissionApiRef);
  const { isModerator } = useIsModerator();
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const usePermissions = useMemo(
    () => configApi.getOptionalBoolean('qeta.permissions') ?? false,
    [configApi],
  );

  useEffect(() => {
    if (usePermissions) {
      permissionApi
        .authorize({ permission: qetaReadPostReviewPermission })
        .then(resp => {
          setCanReview(resp.result === AuthorizeResult.ALLOW);
          setLoading(false);
        })
        .catch(() => {
          setCanReview(false);
          setLoading(false);
        });
      return;
    }

    setCanReview(isModerator);
    setLoading(false);
  }, [isModerator, permissionApi, usePermissions]);

  return { canReview, loading };
};
