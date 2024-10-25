import React, { useCallback, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';

let followedTags: string[] | undefined = undefined;

export const useTagsFollow = () => {
  const [tags, setTags] = React.useState<string[]>(followedTags ?? []);
  const [loading, setLoading] = React.useState(followedTags === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedTags === undefined) {
      qetaApi.getFollowedTags().then(res => {
        followedTags = res.tags;
        setTags(res.tags);
        setLoading(false);
      });
    } else {
      setTags(followedTags);
    }
  }, [qetaApi]);

  const followTag = useCallback(
    (tag: string) => {
      qetaApi.followTag(tag).then(() => {
        setTags(prev => [...prev, tag]);
        followedTags?.push(tag);
      });
    },
    [qetaApi],
  );

  const unfollowTag = useCallback(
    (tag: string) => {
      qetaApi.unfollowTag(tag).then(() => {
        setTags(prev => prev.filter(t => t !== tag));
        followedTags = followedTags?.filter(t => t !== tag);
      });
    },
    [qetaApi],
  );

  const isFollowingTag = useCallback(
    (tag: string) => tags.includes(tag),
    [tags],
  );
  return {
    tags,
    followTag,
    unfollowTag,
    isFollowingTag,
    loading,
  };
};
