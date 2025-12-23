import {
  PostHighlightListContent,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Post } from '@drodil/backstage-plugin-qeta-common';

export const SimilarPosts = (props: { post: Post }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  const { value: similarPosts, loading } = useQetaApi(
    api => {
      if (!post.title || post.title.length === 0) {
        return Promise.resolve({ posts: [], total: 0 });
      }
      return api.suggest({
        title: post.title,
        content: post.content,
        tags: post.tags,
        entities: post.entities,
      });
    },
    [post.id, post.title, post.content, post.tags, post.entities],
  );

  const filteredPosts = (similarPosts?.posts ?? []).filter(
    p => p.id !== post.id,
  );

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <PostHighlightListContent
      title={t('rightMenu.similarPosts', {})}
      posts={filteredPosts}
      loading={loading}
      disableLoading
    />
  );
};
