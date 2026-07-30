import {
  Avatar,
  Box,
  Flex,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  Post,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useUserInfo } from '../../hooks';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import {
  RiCheckboxCircleLine,
  RiChat3Line,
  RiEyeLine,
  RiQuestionAnswerLine,
  RiThumbUpLine,
} from '@remixicon/react';
import { ReactNode, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: Post; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<Post | undefined>> = new Map();
const TTL = 5 * 60 * 1000;

type TooltipPlacement =
  | 'top'
  | 'top start'
  | 'top end'
  | 'bottom'
  | 'bottom start'
  | 'bottom end'
  | 'left'
  | 'left top'
  | 'left bottom'
  | 'right'
  | 'right top'
  | 'right bottom';

const PostTooltipContent = ({
  post: propsPost,
  id,
}: {
  post?: Post;
  id?: string | number;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);
  const styles = useTooltipStyles();
  const [post, setPost] = useState<Post | undefined>(propsPost);

  useEffect(() => {
    if (propsPost) {
      setPost(propsPost);
      return;
    }

    if (id) {
      const cached = cache.get(id.toString());
      if (cached && Date.now() - cached.timestamp < TTL) {
        setPost(cached.data);
        return;
      }

      const strId = id.toString();
      if (requestCache.has(strId)) {
        requestCache.get(strId)!.then(res => {
          if (res) setPost(res);
        });
        return;
      }

      const promise = qetaApi.getPost(id).then(res => {
        if (res) {
          cache.set(strId, { data: res, timestamp: Date.now() });
          return res;
        }
        return undefined;
      });

      requestCache.set(strId, promise);
      promise.then(res => {
        if (res) setPost(res);
        requestCache.delete(strId);
      });
    }
  }, [propsPost, id, qetaApi]);

  const { name, user } = useUserInfo(
    post?.author ?? '',
    post?.anonymous ?? false,
  );

  if (!post) {
    return (
      <Flex direction="column" gap="2">
        <Skeleton width={200} height={24} />
        <Flex align="center" gap="2">
          <Skeleton rounded width={20} height={20} />
          <Skeleton width={100} height={20} />
        </Flex>
        <Skeleton width={280} height={80} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="2">
      <Text variant="body-medium" weight="bold">
        {post.title}
      </Text>

      <Flex align="center" gap="2">
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          size="x-small"
        />
        <Text variant="body-small">{name}</Text>
        <Text variant="body-x-small" color="secondary">
          <RelativeTimeWithTooltip value={post.created} />
        </Text>
      </Flex>

      {post.tags && post.tags.length > 0 && (
        <Text variant="body-x-small" color="secondary">
          {post.tags.map(tag => `#${tag}`).join(' ')}
        </Text>
      )}

      {post.content && (
        <Text variant="body-small" color="secondary">
          {truncate(removeMarkdownFormatting(post.content), 150)}
        </Text>
      )}

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <RiThumbUpLine size={14} />
          <Text variant="body-x-small">
            {post.score} {t('common.votes', {})}
          </Text>
        </div>

        <div className={styles.stat}>
          <RiEyeLine size={14} />
          <Text variant="body-x-small">
            {post.views} {t('common.views', {})}
          </Text>
        </div>

        {post.type === 'question' && (
          <div className={styles.stat}>
            <RiQuestionAnswerLine size={14} />
            <Text variant="body-x-small">
              {post.answersCount} {t('common.answers', {})}
            </Text>
          </div>
        )}

        <div className={styles.stat}>
          <RiChat3Line size={14} />
          <Text variant="body-x-small">
            {post.commentsCount} {t('common.comments', {})}
          </Text>
        </div>

        {post.correctAnswer && (
          <div className={styles.stat}>
            <RiCheckboxCircleLine size={14} color="var(--bui-fg-positive)" />
            <Text variant="body-x-small" color="success">
              {t('questionPage.correctAnswer', {})}
            </Text>
          </div>
        )}
      </div>
    </Flex>
  );
};

export const PostTooltip = (props: {
  post?: Post;
  id?: string | number;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  [key: string]: unknown;
}) => {
  const {
    post: propsPost,
    id,
    children,
    className,
    placement,
    enterDelay,
  } = props;

  return (
    <TooltipTrigger delay={enterDelay}>
      {className ? <span className={className}>{children}</span> : children}
      <Tooltip placement={placement}>
        <Box p="2" maxWidth="300px">
          <PostTooltipContent post={propsPost} id={id} />
        </Box>
      </Tooltip>
    </TooltipTrigger>
  );
};
