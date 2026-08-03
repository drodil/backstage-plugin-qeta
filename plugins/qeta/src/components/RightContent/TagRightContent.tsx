import {
  FollowedTagsList,
  PostHighlightList,
  PostHighlightListContainer,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiFireLine } from '@remixicon/react';

export const TagRightContent = (props: { tags?: string[] }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { tags } = props;

  return (
    <>
      <FollowedTagsList />
      {tags && tags.length > 0 ? (
        <>
          <PostHighlightList
            type="hot"
            title={t('highlights.hotQuestions.title')}
            noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
            icon={<RiFireLine size={16} />}
            options={{ tags: tags }}
            postType="question"
          />
          <PostHighlightList
            type="unanswered"
            title={t('highlights.unanswered.title')}
            noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
            options={{ tags: tags }}
            postType="question"
          />
          <PostHighlightList
            type="incorrect"
            title={t('highlights.incorrect.title')}
            noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
            options={{ tags: tags }}
            postType="question"
          />
        </>
      ) : (
        <PostHighlightListContainer />
      )}
    </>
  );
};
