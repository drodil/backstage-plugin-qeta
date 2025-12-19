import {
  FollowedEntitiesList,
  FollowedTagsList,
  PostHighlightList,
  qetaTranslationRef,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Whatshot from '@material-ui/icons/Whatshot';

export const LinksRightContent = (props: {
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
        title={t('highlights.hotLinks.title')}
        noQuestionsLabel={t('highlights.hotLinks.noLinksLabel')}
        icon={<Whatshot fontSize="small" />}
        postType="link"
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
