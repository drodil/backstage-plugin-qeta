import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useFollow } from './useFollow';

export const useEntityFollow = () => {
  const qetaApi = useApi(qetaApiRef);

  const { items, follow, unfollow, isFollowing, loading } = useFollow<string>(
    'entities',
    {
      fetchFollowed: useCallback(
        () => qetaApi.getFollowedEntities().then(res => res.entityRefs),
        [qetaApi],
      ),
      followItem: useCallback(
        (entityRef: string) => qetaApi.followEntity(entityRef),
        [qetaApi],
      ),
      unfollowItem: useCallback(
        (entityRef: string) => qetaApi.unfollowEntity(entityRef),
        [qetaApi],
      ),
      isEqual: (a, b) => a === b,
    },
  );

  return {
    entities: items,
    followEntity: follow,
    unfollowEntity: unfollow,
    isFollowingEntity: isFollowing,
    loading,
  };
};
