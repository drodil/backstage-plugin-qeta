import {
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
      <PostHighlightList
        type="recent"
        title={t('highlights.recent.title')}
        noQuestionsLabel={t('highlights.recent.noQuestionsLabel')}
        options={{ limit: 5 }}
        hideIfEmpty
      />
      <PostHighlightList
        type="followed"
        title={t('highlights.followed.title')}
        noQuestionsLabel={t('highlights.followed.noQuestionsLabel')}
        options={{ following: true, limit: 5 }}
        hideIfEmpty
      />
      <PostHighlightList
        type="hot"
        title={t('highlights.hot.title')}
        noQuestionsLabel={t('highlights.hot.noQuestionsLabel')}
        options={{ orderBy: 'trend', limit: 5 }}
        hideIfEmpty
      />
      {user && (
        <PostHighlightList
          type="own"
          title={t('highlights.own.title')}
          noQuestionsLabel={t('highlights.own.noQuestionsLabel')}
          postType="question"
          options={{ author: user.userEntityRef, limit: 5 }}
          hideIfEmpty
        />
      )}
      <PostHighlightList
        type="unanswered"
        title={t('highlights.unanswered.title')}
        noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
        postType="question"
        options={{ noAnswers: true, limit: 5 }}
        hideIfEmpty
      />
    </>
  );
};
