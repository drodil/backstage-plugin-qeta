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
  makeStyles,
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

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
  },
  cardContent: {
    padding: theme.spacing(1.5, 2, 1, 2),
  },
  cardContentFooter: {
    padding: theme.spacing(1, 2, 1.5, 2),
  },
  title: {
    fontSize: '1.08rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  content: {
    marginBottom: 0,
  },
  footer: {
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(0.5),
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  avatar: {
    width: 24,
    height: 24,
  },
  rankingControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  rankingButton: {
    padding: theme.spacing(0.5),
  },
}));

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity, allowRanking, onRankUpdate, collectionId } = props;
  const [views, setViews] = useState(post.views);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();

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
    <Card className={classes.card}>
      <CardActionArea
        onClick={() => navigate(href)}
        aria-label={post.title}
        tabIndex={0}
        role="link"
        style={{ outline: 'none' }}
      >
        {post.headerImage && (
          <CardMedia
            component="img"
            height="140"
            image={post.headerImage}
            alt={post.title}
            style={{ objectFit: 'cover' }}
          />
        )}
        <CardContent className={classes.cardContent}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            className={classes.title}
          >
            {post.title}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            gutterBottom
            className={classes.content}
          >
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(post.content), 400),
            )}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardContent className={classes.cardContentFooter}>
        <TagsAndEntities entity={post} />
        <Box className={classes.footer}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className={classes.metadataItem}
                  >
                    {t('common.viewsCount', { count: views })}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className={classes.metadataItem}
                  >
                    {t('common.votesCount', { count: post.score })}
                  </Typography>
                </Grid>
                {post.type === 'question' && (
                  <Grid item>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      className={classes.metadataItem}
                    >
                      {t('common.answersCount', { count: post.answersCount })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Grid item>
                  <SmallAvatar
                    src={user?.spec?.profile?.picture}
                    alt={name}
                    variant="rounded"
                    className={classes.avatar}
                  >
                    {initials}
                  </SmallAvatar>
                </Grid>
                <Grid item>
                  <UserLink
                    entityRef={post.author}
                    anonymous={post.anonymous}
                  />
                </Grid>
                <Grid item>
                  <Link to={href} className="qetaPostListItemQuestionBtn">
                    <RelativeTimeWithTooltip value={post.created} />
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {allowRanking && (
            <Box className={classes.rankingControls}>
              <Tooltip title={t('ranking.top')}>
                <IconButton
                  size="small"
                  onClick={() => rank('top')}
                  className={classes.rankingButton}
                >
                  <VerticalAlignTopIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('ranking.up')}>
                <IconButton
                  size="small"
                  onClick={() => rank('up')}
                  className={classes.rankingButton}
                >
                  <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('ranking.down')}>
                <IconButton
                  size="small"
                  onClick={() => rank('down')}
                  className={classes.rankingButton}
                >
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('ranking.bottom')}>
                <IconButton
                  size="small"
                  onClick={() => rank('bottom')}
                  className={classes.rankingButton}
                >
                  <VerticalAlignBottomIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
