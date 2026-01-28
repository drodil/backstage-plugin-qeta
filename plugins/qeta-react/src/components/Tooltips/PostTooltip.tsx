import {
  Avatar,
  Box,
  Grid,
  Tooltip,
  TooltipProps,
  Typography,
} from '@material-ui/core';
import {
  Post,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useUserInfo } from '../../hooks';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import ThumbUpOutlined from '@material-ui/icons/ThumbUpOutlined';
import VisibilityOutlined from '@material-ui/icons/VisibilityOutlined';
import QuestionAnswerOutlined from '@material-ui/icons/QuestionAnswerOutlined';
import ChatBubbleOutline from '@material-ui/icons/ChatBubbleOutline';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';
import { Skeleton } from '@material-ui/lab';

const cache: Map<string, { data: Post; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<Post | undefined>> = new Map();
const TTL = 5 * 60 * 1000;

const PostTooltipContent = ({
  post: propsPost,
  id,
}: {
  post?: Post;
  id?: string | number;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);
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

  const { name, initials, user } = useUserInfo(
    post?.author ?? '',
    post?.anonymous ?? false,
  );

  if (!post) {
    return (
      <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
        <Grid item xs={12}>
          <Skeleton variant="text" width={200} height={24} />
          <Skeleton
            variant="circle"
            width={20}
            height={20}
            style={{ display: 'inline-block', marginRight: 8 }}
          />
          <Skeleton
            variant="text"
            width={100}
            height={20}
            style={{ display: 'inline-block' }}
          />
          <Skeleton
            variant="rect"
            width={280}
            height={80}
            style={{ marginTop: 8 }}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container style={{ padding: '0.5em', maxWidth: 300 }} spacing={1}>
      <Grid item xs={12}>
        <Typography
          variant="subtitle1"
          style={{
            fontWeight: 600,
            marginBottom: '0.5em',
          }}
        >
          {post.title}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5em',
          }}
        >
          <Box style={{ display: 'inline-block', marginRight: '0.5em' }}>
            <Avatar
              src={user?.spec?.profile?.picture}
              alt={name}
              variant="rounded"
              style={{ width: '20px', height: '20px' }}
            >
              {initials}
            </Avatar>
          </Box>
          <Typography variant="body2" style={{ marginRight: '0.5em' }}>
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={{ marginTop: '0.2em' }}
          >
            <RelativeTimeWithTooltip value={post.created} />
          </Typography>
        </Box>
      </Grid>

      {post.tags && post.tags.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="caption" color="textSecondary">
            {post.tags.map(tag => `#${tag}`).join(' ')}
          </Typography>
        </Grid>
      )}

      {post.content && (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            {truncate(removeMarkdownFormatting(post.content), 150)}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          style={{ gap: '0.5em' }}
        >
          <Box display="flex" alignItems="center">
            <ThumbUpOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.score} {t('common.votes', {})}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <VisibilityOutlined
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.views} {t('common.views', {})}
            </Typography>
          </Box>

          {post.type === 'question' && (
            <Box display="flex" alignItems="center">
              <QuestionAnswerOutlined
                style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
              />
              <Typography variant="caption">
                {post.answersCount} {t('common.answers', {})}
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center">
            <ChatBubbleOutline
              style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
            />
            <Typography variant="caption">
              {post.commentsCount} {t('common.comments', {})}
            </Typography>
          </Box>

          {post.correctAnswer && (
            <Box display="flex" alignItems="center" color="success.main">
              <CheckCircleOutline
                style={{ fontSize: '0.875rem', marginRight: '0.25em' }}
              />
              <Typography variant="caption">
                {t('questionPage.correctAnswer', {})}
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export const PostTooltip = (
  props: {
    post?: Post;
    id?: string | number;
    interactive?: boolean;
  } & Omit<TooltipProps, 'title'>,
) => {
  const {
    post: propsPost,
    id,
    interactive = true,
    children,
    className,
    ...tooltipProps
  } = props;
  const classes = useTooltipStyles();

  return (
    <Tooltip
      title={<PostTooltipContent post={propsPost} id={id} />}
      interactive={interactive}
      arrow
      classes={{
        tooltip: classes.tooltip,
        arrow: classes.tooltipArrow,
        ...props.classes,
      }}
      className={className}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};
