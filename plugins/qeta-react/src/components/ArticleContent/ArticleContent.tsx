import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Avatar, Box, Flex, Text } from '@backstage/ui';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useState } from 'react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { ArticleButtons } from './ArticleButtons';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { DraftBanner } from '../Utility/DraftBanner';
import { DeletedBanner } from '../Utility/DeletedBanner.tsx';
import { ObsoleteBanner } from '../Utility/ObsoleteBanner.tsx';
import { getPostDisplayDate } from '../../utils/utils';
import styles from './ArticleContent.module.css';

export const ArticleContent = (props: {
  post: PostResponse;
  views: number;
}) => {
  const { post, views } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { name, user } = useEntityAuthor(post);
  const [postEntity, setPostEntity] = useState(post);
  const onCommentAction = (q: PostResponse, _?: AnswerResponse) => {
    setPostEntity(q);
  };

  if (post.type !== 'article') {
    return (
      <WarningPanel title="Not found" message="Could not find the article" />
    );
  }

  return (
    <>
      {postEntity.status === 'draft' && <DraftBanner />}
      {postEntity.status === 'deleted' && <DeletedBanner />}
      {postEntity.status === 'obsolete' && <ObsoleteBanner />}
      <Flex align="center" gap="2" className={styles.authorRow}>
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          className="qetaAvatar avatar"
        />
        <div>
          <Text variant="body-medium" weight="bold" as="div">
            {name}
          </Text>
          <Text variant="body-small" color="secondary" as="div">
            {t('common.viewsCount', { count: views })} {' · '}
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={getPostDisplayDate(postEntity)} />
          </Text>
        </div>
      </Flex>
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
