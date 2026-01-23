import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import DataLoader from 'dataloader';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';

const loaderCache = new WeakMap<
  QetaApi,
  DataLoader<string, string | undefined>
>();

const getFaviconLoader = (
  qetaApi: QetaApi,
): DataLoader<string, string | undefined> => {
  const cached = loaderCache.get(qetaApi);
  if (cached) {
    return cached;
  }

  const loader = new DataLoader<string, string | undefined>(
    async (urls: readonly string[]) => {
      try {
        const response = await qetaApi.fetchBatchURLMetadata({
          urls: [...urls],
        });

        return urls.map(url => {
          const metadata = response.metadata?.[url];
          return metadata?.favicon;
        });
      } catch {
        return urls.map(() => undefined);
      }
    },
    {
      cache: true,
      batchScheduleFn: callback => setTimeout(callback, 10),
      maxBatchSize: 50,
    },
  );

  loaderCache.set(qetaApi, loader);
  return loader;
};

export const useFavicon = (url?: string): string | undefined => {
  const qetaApi = useApi(qetaApiRef);
  const [favicon, setFavicon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setFavicon(undefined);
      return;
    }

    const loader = getFaviconLoader(qetaApi);

    loader
      .load(url)
      .then(setFavicon)
      .catch(() => {
        setFavicon(undefined);
      });
  }, [url, qetaApi]);

  return favicon;
};
