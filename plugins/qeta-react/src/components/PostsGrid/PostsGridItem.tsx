import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import React, { useEffect, useState } from 'react';
import { useStyles, useTranslation } from '../../utils';
import { useSignal } from '@backstage/plugin-signals-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef, userRouteRef } from '../../routes';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import { useEntityAuthor } from '../../utils/hooks';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';

export interface PostsGridItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
}

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity } = props;
  const [views, setViews] = useState(post.views);
  const { t } = useTranslation();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(post);
  const navigate = useNavigate();

  const route = post.type === 'question' ? questionRoute : articleRoute;
  const href = entity
    ? `${route({
        id: post.id.toString(10),
      })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  return (
    <Card style={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(href)}>
        {post.headerImage && (
          <CardMedia
            component="img"
            height="140"
            image={post.headerImage}
            alt={post.title}
          />
        )}
        <CardContent style={{ paddingBottom: '0.5rem' }}>
          <Typography gutterBottom variant="h6" component="div">
            {post.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(post.content), 400),
            )}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardContent style={{ paddingTop: '0.5rem' }}>
        <TagsAndEntities post={post} />
        <Box style={{ paddingLeft: '0.2rem', paddingTop: '0.5rem' }}>
          <Typography variant="caption">
            <Avatar
              src={user?.spec?.profile?.picture}
              className={styles.questionListItemAvatar}
              alt={name}
              variant="rounded"
            >
              {initials}
            </Avatar>
            {post.author === 'anonymous' ? (
              t('common.anonymousAuthor')
            ) : (
              <Link to={`${userRoute()}/${post.author}`}>{name}</Link>
            )}{' '}
            <Link to={href} className="qetaPostListItemQuestionBtn">
              <RelativeTimeWithTooltip value={post.created} />
            </Link>
            {' · '}
            {t('common.views', { count: views })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
