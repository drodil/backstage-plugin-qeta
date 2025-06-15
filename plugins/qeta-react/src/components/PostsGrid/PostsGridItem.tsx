import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { qetaApiRef } from '../../api';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { UserLink } from '../Links';
import { SmallAvatar } from '../Utility/SmallAvatar';

export interface PostsGridItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
  allowRanking?: boolean;
  onRankUpdate?: () => void;
  collectionId?: number;
}

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity, allowRanking, onRankUpdate, collectionId } = props;
  const [views, setViews] = useState(post.views);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const { name, initials, user } = useEntityAuthor(post);
  const navigate = useNavigate();

  const route = post.type === 'question' ? questionRoute : articleRoute;
  const href = entity
    ? `${route({
        id: post.id.toString(10),
      })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  const rank = (direction: 'top' | 'bottom' | 'up' | 'down') => {
    if (!collectionId) {
      return;
    }
    qetaApi.rankPostInCollection(collectionId, post.id, direction).then(res => {
      if (res) {
        onRankUpdate?.();
      }
    });
  };

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
        <TagsAndEntities entity={post} />
        <Box style={{ paddingLeft: '0.2rem', paddingTop: '0.5rem' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle2">
                {t('common.views', { count: views })}
              </Typography>
            </Grid>
            <Grid item>
              <SmallAvatar
                src={user?.spec?.profile?.picture}
                alt={name}
                variant="rounded"
              >
                {initials}
              </SmallAvatar>
              <UserLink entityRef={post.author} anonymous={post.anonymous} />{' '}
              <Link to={href} className="qetaPostListItemQuestionBtn">
                <RelativeTimeWithTooltip value={post.created} />
              </Link>
            </Grid>
          </Grid>
        </Box>
        {allowRanking && (
          <Box
            style={{
              paddingRight: '0.2em',
              paddingTop: '0.8em',
              paddingBottom: '0.2em',
              float: 'right',
            }}
          >
            <Tooltip title={t('ranking.top')}>
              <IconButton size="small" onClick={() => rank('top')}>
                <VerticalAlignTopIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('ranking.up')}>
              <IconButton size="small" onClick={() => rank('up')}>
                <KeyboardArrowUpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('ranking.down')}>
              <IconButton size="small" onClick={() => rank('down')}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('ranking.bottom')}>
              <IconButton size="small" onClick={() => rank('bottom')}>
                <VerticalAlignBottomIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
