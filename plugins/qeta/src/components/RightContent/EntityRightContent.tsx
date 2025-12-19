import {
  FollowedEntitiesList,
  PostHighlightList,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Whatshot from '@material-ui/icons/Whatshot';

export const EntityRightContent = (props: { entityRef?: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { entityRef } = props;
  const entities = entityRef ? [entityRef] : undefined;

  return (
    <>
      <FollowedEntitiesList />
      <PostHighlightList
        type="hot"
        title={t('highlights.hotQuestions.title')}
        noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
        icon={<Whatshot fontSize="small" />}
        options={{ entities: entities }}
        postType="question"
      />
      <PostHighlightList
        type="unanswered"
        title={t('highlights.unanswered.title')}
        noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
        options={{ entities: entities }}
        postType="question"
      />
      <PostHighlightList
        type="incorrect"
        title={t('highlights.incorrect.title')}
        noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
        options={{ entities: entities }}
        postType="question"
      />
    </>
  );
};
