import {
  FollowedCollectionsList,
  PostHighlightListContainer,
} from '@drodil/backstage-plugin-qeta-react';

export const CollectionsRightContent = () => {
  return (
    <>
      <FollowedCollectionsList />
      <PostHighlightListContainer />
    </>
  );
};
