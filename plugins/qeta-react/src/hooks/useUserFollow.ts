import { useState, useCallback, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';

let followedUsers: string[] | undefined = undefined;

export const useUserFollow = () => {
  const [users, setUsers] = useState<string[]>(followedUsers ?? []);
  const [loading, setLoading] = useState(followedUsers === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedUsers === undefined) {
      qetaApi.getFollowedUsers().then(res => {
        followedUsers = res.followedUserRefs;
        setUsers(res.followedUserRefs);
        setLoading(false);
      });
    } else {
      setUsers(followedUsers);
    }
  }, [qetaApi]);

  const followUser = useCallback(
    (user: string) => {
      qetaApi.followUser(user).then(() => {
        setUsers(prev => [...prev, user]);
        followedUsers?.push(user);
      });
    },
    [qetaApi],
  );

  const unfollowUser = useCallback(
    (user: string) => {
      qetaApi.unfollowUser(user).then(() => {
        setUsers(prev => prev.filter(t => t !== user));
        followedUsers = followedUsers?.filter(t => t !== user);
      });
    },
    [qetaApi],
  );

  const isFollowingUser = useCallback(
    (user: string) => users.includes(user),
    [users],
  );
  return {
    users,
    followUser,
    unfollowUser,
    isFollowingUser,
    loading,
  };
};
