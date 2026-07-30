import { useParams } from 'react-router-dom';
import {
  FollowedCollectionsList,
  FollowedEntitiesList,
  FollowedTagsList,
  FollowedUsersList,
  PostHighlightList,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { DefaultRightContent } from './DefaultRightContent';
import { ContentHealthCard } from '../ContentHealthCard';
import { SimilarPosts } from './SimilarPosts';
import { Box } from '@backstage/ui';
import { RiFireLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { LinkedPosts } from './LinkedPosts';

export const PostRightContent = (props?: { id?: string }) => {
  const { id: paramId } = useParams();
  const id = props?.id || paramId;
  const { t } = useTranslationRef(qetaTranslationRef);

  const { value: post } = useQetaApi(
    api => api.getPost(id, { anonymous: true }),
    [id],
  );

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
          <Box mb="4">
            <ContentHealthCard post={post} />
          </Box>
          <LinkedPosts postId={post.id} />
          <SimilarPosts post={post} />
          <PostHighlightList
            type="hot"
            title={title}
            noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
            icon={<RiFireLine size={16} />}
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
