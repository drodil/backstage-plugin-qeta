import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { useFollow } from './useFollow';

export const useCollectionsFollow = () => {
  const qetaApi = useApi(qetaApiRef);

  const { items, follow, unfollow, isFollowing, loading } =
    useFollow<Collection>('collections', {
      fetchFollowed: useCallback(
        () => qetaApi.getFollowedCollections().then(res => res.collections),
        [qetaApi],
      ),
      followItem: useCallback(
        (collection: Collection) => qetaApi.followCollection(collection.id),
        [qetaApi],
      ),
      unfollowItem: useCallback(
        (collection: Collection) => qetaApi.unfollowCollection(collection.id),
        [qetaApi],
      ),
      isEqual: (a, b) => a.id === b.id,
    });

  return {
    collections: items,
    followCollection: follow,
    unfollowCollection: unfollow,
    isFollowingCollection: isFollowing,
    loading,
  };
};
