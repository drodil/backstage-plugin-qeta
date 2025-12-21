import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
} from '@drodil/backstage-plugin-qeta-react';
import { SimilarQuestions } from './SimilarQuestions';

export const AskRightContent = () => {
  return (
    <>
      <SimilarQuestions />
      <FollowedTagsList />
      <FollowedEntitiesList />
      <FollowedUsersList />
      <FollowedCollectionsList />
    </>
  );
};
