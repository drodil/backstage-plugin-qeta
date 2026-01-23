import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';

interface UseFollowOptions<T> {
  fetchFollowed: () => Promise<T[]>;
  followItem: (item: T) => Promise<unknown>;
  unfollowItem: (item: T) => Promise<unknown>;
  isEqual: (a: T, b: T) => boolean;
}

interface UseFollowCache<T> {
  data: T[] | undefined;
  promise: Promise<T[]> | undefined;
}

const caches = new Map<string, UseFollowCache<any>>();

export const useFollow = <T>(key: string, options: UseFollowOptions<T>) => {
  const { fetchFollowed, followItem, unfollowItem, isEqual } = options;

  // Get or create cache for this key
  if (!caches.has(key)) {
    caches.set(key, { data: undefined, promise: undefined });
  }
  const cache = caches.get(key) as UseFollowCache<T>;

  const [items, setItems] = useState<T[]>(cache.data ?? []);
  const [loading, setLoading] = useState(cache.data === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (cache.data === undefined) {
      cache.promise ??= fetchFollowed().then(result => {
        cache.data = result;
        cache.promise = undefined;
        return result;
      });
      cache.promise.then(result => {
        setItems(result);
        setLoading(false);
      });
    } else {
      setItems(cache.data);
    }
  }, [qetaApi, fetchFollowed, cache]);

  const follow = useCallback(
    (item: T) => {
      followItem(item).then(() => {
        setItems(prev => [...prev, item]);
        cache.data?.push(item);
      });
    },
    [followItem, cache],
  );

  const unfollow = useCallback(
    (item: T) => {
      unfollowItem(item).then(() => {
        setItems(prev => prev.filter(i => !isEqual(i, item)));
        cache.data = cache.data?.filter(i => !isEqual(i, item));
      });
    },
    [unfollowItem, isEqual, cache],
  );

  const isFollowing = useCallback(
    (item: T) => items.some(i => isEqual(i, item)),
    [items, isEqual],
  );

  return {
    items,
    follow,
    unfollow,
    isFollowing,
    loading,
  };
};
