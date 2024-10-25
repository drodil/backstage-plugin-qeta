import React, { useCallback, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../api';

let followedEntities: string[] | undefined = undefined;

export const useEntityFollow = () => {
  const [entities, setEntities] = React.useState<string[]>(
    followedEntities ?? [],
  );
  const [loading, setLoading] = React.useState(followedEntities === undefined);
  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (followedEntities === undefined) {
      qetaApi.getFollowedEntities().then(res => {
        followedEntities = res.entityRefs;
        setEntities(res.entityRefs);
        setLoading(false);
      });
    } else {
      setEntities(followedEntities);
    }
  }, [qetaApi]);

  const followEntity = useCallback(
    (entityRef: string) => {
      qetaApi.followEntity(entityRef).then(() => {
        setEntities(prev => [...prev, entityRef]);
        followedEntities?.push(entityRef);
      });
    },
    [qetaApi],
  );

  const unfollowEntity = useCallback(
    (entityRef: string) => {
      qetaApi.unfollowEntity(entityRef).then(() => {
        setEntities(prev => prev.filter(t => t !== entityRef));
        followedEntities = followedEntities?.filter(t => t !== entityRef);
      });
    },
    [qetaApi],
  );

  const isFollowingEntity = useCallback(
    (entityRef: string) => entities.includes(entityRef),
    [entities],
  );
  return { entities, followEntity, unfollowEntity, isFollowingEntity, loading };
};
