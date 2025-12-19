import {
  FollowedUsersList,
  PostHighlightListContainer,
} from '@drodil/backstage-plugin-qeta-react';

export const UsersRightContent = () => {
  return (
    <>
      <FollowedUsersList />
      <PostHighlightListContainer />
    </>
  );
};
