import {
  PostHighlightListContent,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiLinksLine } from '@remixicon/react';
import styles from './LinkedPosts.module.css';

export const LinkedPosts = (props: { postId: number }) => {
  const { postId } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  const {
    value: posts,
    loading,
    error,
  } = useQetaApi(api => api.getLinkedPosts(postId), [postId]);

  if (error || !posts || posts.length === 0) {
    return null;
  }

  return (
    <PostHighlightListContent
      title={t('rightMenu.linkedPosts')}
      posts={posts}
      loading={loading}
      containerClassName={styles.container}
      titleClassName={styles.title}
      icon={<RiLinksLine size={16} />}
    />
  );
};
