import { QetaApi, qetaApiRef } from '../api';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';

export function useQetaApi<T>(
  f: (api: QetaApi) => Promise<T>,
  deps: any[] = [],
) {
  const qetaApi = useApi(qetaApiRef);

  return useAsync(async () => {
    return await f(qetaApi);
  }, deps);
}
