import React, { useCallback, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';
import { Collection } from '@drodil/backstage-plugin-qeta-common';

let followedCollections: Collection[] | undefined = undefined;

export const useCollectionsFollow = () => {
  const [collections, setCollections] = React.useState<Collection[]>(
    followedCollections ?? [],
  );
  const [loading, setLoading] = React.useState(
    followedCollections === undefined,
  );
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedCollections === undefined) {
      qetaApi.getFollowedCollections().then(res => {
        followedCollections = res.collections;
        setCollections(followedCollections);
        setLoading(false);
      });
    } else {
      setCollections(followedCollections);
    }
  }, [qetaApi]);

  const followCollection = useCallback(
    (collection: Collection) => {
      qetaApi.followCollection(collection.id).then(() => {
        setCollections(prev => [...prev, collection]);
        followedCollections?.push(collection);
      });
    },
    [qetaApi],
  );

  const unfollowCollection = useCallback(
    (collection: Collection) => {
      qetaApi.unfollowCollection(collection.id).then(() => {
        setCollections(prev => prev.filter(t => t.id !== collection.id));
        followedCollections = followedCollections?.filter(
          t => t.id !== collection.id,
        );
      });
    },
    [qetaApi],
  );

  const isFollowingCollection = useCallback(
    (collection: Collection) =>
      Boolean(collections.find(t => t.id === collection.id)),
    [collections],
  );
  return {
    collections,
    followCollection,
    unfollowCollection,
    isFollowingCollection,
    loading,
  };
};
