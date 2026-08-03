import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Alert, Box, Text } from '@backstage/ui';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useState } from 'react';
import { ArticleButtons } from './ArticleButtons';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { DraftBanner } from '../Utility/DraftBanner';
import { DeletedBanner } from '../Utility/DeletedBanner.tsx';
import { ObsoleteBanner } from '../Utility/ObsoleteBanner.tsx';
import styles from './ArticleContent.module.css';

export const ArticleContent = (props: {
  post: PostResponse;
  views: number;
}) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const [postEntity, setPostEntity] = useState(post);
  const onCommentAction = (q: PostResponse, _?: AnswerResponse) => {
    setPostEntity(q);
  };

  if (post.type !== 'article') {
    return (
      <Alert
        status="warning"
        title="Not found"
        description="Could not find the article"
      />
    );
  }

  return (
    <>
      {postEntity.status === 'draft' && <DraftBanner />}
      {postEntity.status === 'deleted' && <DeletedBanner />}
      {postEntity.status === 'obsolete' && <ObsoleteBanner />}
      <ArticleButtons post={postEntity} />
      {postEntity.headerImage && (
        <img
          src={post.headerImage}
          alt={post.title}
          onError={e => (e.currentTarget.style.display = 'none')}
          className={styles.headerImage}
        />
      )}
      <MarkdownRenderer
        content={postEntity.content}
        className={styles.content}
        showToc
      />
      {post.status === 'active' && (
        <Box className={styles.commentSectionContainer}>
          <Text variant="title-small" as="div">
            {t('common.comments')}
          </Text>
          <CommentSection
            className={styles.commentSection}
            post={postEntity}
            onCommentAction={onCommentAction}
            showProminentButton
          />
        </Box>
      )}
      <TagsAndEntities entity={postEntity} />
    </>
  );
};
