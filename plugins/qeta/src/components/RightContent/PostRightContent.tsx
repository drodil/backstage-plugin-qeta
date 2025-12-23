import { useParams } from 'react-router-dom';
import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  PostHighlightList,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { DefaultRightContent } from './DefaultRightContent';
import { ContentHealthCard } from '../ContentHealthCard';
import { SimilarPosts } from './SimilarPosts';
import { Box } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';

export const PostRightContent = (props?: { id?: string }) => {
  const { id: paramId } = useParams();
  const id = props?.id || paramId;
  const { t } = useTranslationRef(qetaTranslationRef);

  const { value: post } = useQetaApi(api => api.getPost(id), [id]);

  let title: string;

  if (post?.type === 'article') {
    title = t('highlights.hotArticles.title');
  } else if (post?.type === 'link') {
    title = t('highlights.hotLinks.title');
  } else {
    title = t('highlights.hotQuestions.title');
  }

  return (
    <>
      {post && (
        <>
          <Box mb={2}>
            <ContentHealthCard post={post} />
          </Box>
          <SimilarPosts post={post} />
          <PostHighlightList
            type="hot"
            title={title}
            noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
            icon={<Whatshot fontSize="small" />}
            postType={post.type}
            options={{
              tags: post.tags,
              entities: post.entities,
            }}
          />
          <FollowedTagsList />
          <FollowedUsersList />
          <FollowedEntitiesList />
          <FollowedCollectionsList />
        </>
      )}
      {!post && <DefaultRightContent />}
    </>
  );
};
