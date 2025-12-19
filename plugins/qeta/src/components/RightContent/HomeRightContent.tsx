import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  ImpactCard,
} from '@drodil/backstage-plugin-qeta-react';

export const HomeRightContent = () => {
  return (
    <>
      <ImpactCard />
      <FollowedTagsList />
      <FollowedUsersList />
      <FollowedEntitiesList />
      <FollowedCollectionsList />
    </>
  );
};
