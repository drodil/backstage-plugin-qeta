import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useFollow } from './useFollow';

export const useTagsFollow = () => {
  const qetaApi = useApi(qetaApiRef);

  const { items, follow, unfollow, isFollowing, loading } = useFollow<string>(
    'tags',
    {
      fetchFollowed: useCallback(
        () => qetaApi.getFollowedTags().then(res => res.tags),
        [qetaApi],
      ),
      followItem: useCallback(
        (tag: string) => qetaApi.followTag(tag),
        [qetaApi],
      ),
      unfollowItem: useCallback(
        (tag: string) => qetaApi.unfollowTag(tag),
        [qetaApi],
      ),
      isEqual: (a, b) => a === b,
    },
  );

  return {
    tags: items,
    followTag: follow,
    unfollowTag: unfollow,
    isFollowingTag: isFollowing,
    loading,
  };
};
