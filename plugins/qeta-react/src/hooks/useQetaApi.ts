import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useAsyncRetry } from 'react-use';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';

export function useQetaApi<T>(
  f: (api: QetaApi) => Promise<T>,
  deps: any[] = [],
) {
  const qetaApi = useApi(qetaApiRef);

  return useAsyncRetry(async () => {
    return await f(qetaApi);
  }, deps);
}
