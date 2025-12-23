import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  ImpactCard,
  PostHighlightList,
  qetaTranslationRef,
  useIdentityApi,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const HomeRightContent = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { value: user } = useIdentityApi(api => api.getBackstageIdentity(), []);

  return (
    <>
      <ImpactCard />
      {user && (
        <PostHighlightList
          type="own"
          title={t('highlights.own.title')}
          noQuestionsLabel={t('highlights.own.noQuestionsLabel')}
          postType="question"
          options={{ author: user.userEntityRef, limit: 5 }}
        />
      )}
      <PostHighlightList
        type="unanswered"
        title={t('highlights.unanswered.title')}
        noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
        postType="question"
        options={{ noAnswers: true, limit: 5 }}
      />
      <FollowedTagsList />
      <FollowedUsersList />
      <FollowedEntitiesList />
      <FollowedCollectionsList />
    </>
  );
};
