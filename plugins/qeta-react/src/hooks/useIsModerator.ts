import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useIdentityApi } from './useIdentityApi';
import { useMemo } from 'react';

export const useIsModerator = () => {
  const configApi = useApi(configApiRef);
  const moderators = useMemo(
    () => configApi.getOptionalStringArray('qeta.moderators') ?? [],
    [configApi],
  );
  const { value: user } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const isModerator = useMemo(() => {
    const ownership: string[] = user?.ownershipEntityRefs ?? [];
    if (user?.userEntityRef && !ownership.includes(user.userEntityRef)) {
      ownership.push(user.userEntityRef);
    }
    return moderators.some((m: string) => ownership.includes(m));
  }, [moderators, user]);
  return { isModerator };
};
