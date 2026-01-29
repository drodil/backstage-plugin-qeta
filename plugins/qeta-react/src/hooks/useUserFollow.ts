import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { useFollow } from './useFollow';
import { UserEntity } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { getEntityAuthorLoader } from './useEntityAuthor';

export const useUserFollow = () => {
  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [userEntities, setUserEntities] = useState<Map<string, UserEntity>>(
    new Map(),
  );

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

  useEffect(() => {
    if (items) {
      const loader = getEntityAuthorLoader(catalogApi);
      Promise.all(items.map(item => loader.load(item))).then(users => {
        const newMap = new Map<string, UserEntity>();
        users.forEach((user, index) => {
          if (user) {
            newMap.set(items[index], user);
          }
        });
        setUserEntities(newMap);
      });
    }
  }, [items, catalogApi]);

  return {
    users: items,
    userEntities,
    followUser: follow,
    unfollowUser: unfollow,
    isFollowingUser: isFollowing,
    loading,
  };
};
