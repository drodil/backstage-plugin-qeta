import {
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiFireLine } from '@remixicon/react';

export const ArticlesRightContent = (props: {
  tags?: string[];
  entityRef?: string;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { tags, entityRef } = props;
  const entities = entityRef ? [entityRef] : undefined;

  return (
    <>
      <PostHighlightList
        type="hot"
        title={t('highlights.hotArticles.title')}
        noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
        icon={<RiFireLine size={16} />}
        postType="article"
        options={{
          tags: tags,
          entities: entities,
        }}
      />
      <FollowedTagsList />
      <FollowedEntitiesList />
    </>
  );
};
