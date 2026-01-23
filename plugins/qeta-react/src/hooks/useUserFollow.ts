import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useFollow } from './useFollow';

export const useUserFollow = () => {
  const qetaApi = useApi(qetaApiRef);

  const { items, follow, unfollow, isFollowing, loading } = useFollow<string>(
    'users',
    {
      fetchFollowed: useCallback(
        () => qetaApi.getFollowedUsers().then(res => res.followedUserRefs),
        [qetaApi],
      ),
      followItem: useCallback(
        (user: string) => qetaApi.followUser(user),
        [qetaApi],
      ),
      unfollowItem: useCallback(
        (user: string) => qetaApi.unfollowUser(user),
        [qetaApi],
      ),
      isEqual: (a, b) => a === b,
    },
  );

  return {
    users: items,
    followUser: follow,
    unfollowUser: unfollow,
    isFollowingUser: isFollowing,
    loading,
  };
};
