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
import {
  articleRouteRef,
  linkRouteRef,
  questionRouteRef
} from '../../routes';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  makeStyles,
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
import { StatusChip } from '../Utility/StatusChip';
import numeral from 'numeral';
import { OpenLinkButton } from "../Buttons/OpenLinkButton.tsx";

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
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  content: {
    marginBottom: 0,
  },
  footer: {
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  statsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  statBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(0.75),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    minWidth: 60,
    gap: theme.spacing(0.5),
    lineHeight: 1.1,
  },
  statValue: {
    fontWeight: 600,
    fontSize: '16px',
  },
  statLabel: {
    fontWeight: 400,
    color: theme.palette.text.secondary,
  },
  answersBox: {
    background: theme.palette.warning.light,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.warning.main}`,
  },
  answersBoxAnswered: {
    background: theme.palette.success.main,
    color: theme.palette.getContrastText(theme.palette.success.main),
    border: `1px solid ${theme.palette.success.dark}`,
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

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity, allowRanking, onRankUpdate, collectionId } = props;
  const [views, setViews] = useState(post.views);
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const { name, initials, user } = useEntityAuthor(post);
  const navigate = useNavigate();

  const route = (() => {
    switch (post.type) {
      case 'article':
        return articleRoute;
      case 'link':
        return linkRoute;
      case 'question':
      default:
        return questionRoute;
    }
  })();

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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              className={classes.title}
            >
              {post.title}
            </Typography>
            <StatusChip status={post.status} />
            {post.type === 'link' && <OpenLinkButton entity={post} />}
          </Box>
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
          <Box className={classes.statsContainer}>
            <Box className={classes.statsGroup}>
              {post.type !== 'link' && (
                <Tooltip title={post.score >= 1000 ? post.score : ''} arrow>
                  <Box className={classes.statBox}>
                    <Typography className={classes.statValue}>
                      {formatShortNumber(post.score)}
                    </Typography>
                    <Typography className={classes.statLabel}>
                      {t('common.votes')}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {post.type === 'question' && (
                <Tooltip title={answersCount >= 1000 ? answersCount : ''} arrow>
                  <Box
                    className={`${classes.statBox} ${
                      correctAnswer
                        ? classes.answersBoxAnswered
                        : classes.answersBox
                    }`}
                  >
                    <Typography className={classes.statValue}>
                      {formatShortNumber(answersCount)}
                    </Typography>
                    <Typography className={classes.statLabel}>
                      {t('common.answers')}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              <Tooltip title={views >= 1000 ? views : ''} arrow>
                <Box className={classes.statBox}>
                  <Typography className={classes.statValue}>
                    {formatShortNumber(views)}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    {t('common.views')}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Box className={classes.statsGroup}>
              <SmallAvatar
                src={user?.spec?.profile?.picture}
                alt={name}
                variant="rounded"
                className={classes.avatar}
              >
                {initials}
              </SmallAvatar>
              <UserLink entityRef={post.author} anonymous={post.anonymous} />
              <Link to={href} className="qetaPostListItemQuestionBtn">
                <RelativeTimeWithTooltip value={post.created} />
              </Link>
            </Box>
          </Box>
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
