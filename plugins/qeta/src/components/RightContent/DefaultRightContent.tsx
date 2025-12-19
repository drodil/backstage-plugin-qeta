import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  PostHighlightList,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import Whatshot from '@material-ui/icons/Whatshot';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const DefaultRightContent = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <>
      <PostHighlightList
        type="hot"
        title={t('highlights.hotQuestions.title')}
        noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
        icon={<Whatshot fontSize="small" />}
        postType="question"
      />
      <FollowedTagsList />
      <FollowedUsersList />
      <FollowedEntitiesList />
      <FollowedCollectionsList />
    </>
  );
};
