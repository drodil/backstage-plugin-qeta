import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  PostHighlightList,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { RiFireLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const DefaultRightContent = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  return (
    <>
      <PostHighlightList
        type="hot"
        title={t('highlights.hotQuestions.title')}
        noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
        icon={<RiFireLine size={16} />}
        postType="question"
      />
      <FollowedTagsList />
      <FollowedUsersList />
      <FollowedEntitiesList />
      <FollowedCollectionsList />
    </>
  );
};
