import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { qetaApiRef } from '../../api';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import LinkIcon from '@material-ui/icons/Link';
import StarIcon from '@material-ui/icons/Star';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { StatusChip } from '../Utility/StatusChip';
import numeral from 'numeral';
import { OpenLinkButton } from '../Buttons/OpenLinkButton.tsx';
import { FaviconItem } from '../FaviconItem';
import { getPostDisplayDate } from '../../utils/utils';
import { RankingButtons } from '../Buttons';

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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  },
  iconsContainer: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(0.5),
    zIndex: 10,
  },
  starIcon: {
    color: '#FFB400',
  },
  obsoleteIcon: {
    color: '#FF9800',
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
    height: '80px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    background: 'transparent',
    minWidth: 50,
    gap: 0,
    border: '1px solid transparent',
  },
  statValue: {
    fontWeight: 700,
    fontSize: '1.2rem',
    lineHeight: 1.2,
  },
  statLabel: {
    fontWeight: 400,
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.2,
  },
  answersBox: {
    color: theme.palette.warning.main,
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 152, 0, 0.05)'
        : 'rgba(255, 152, 0, 0.05)',
  },
  answersBoxAnswered: {
    color: theme.palette.success.main,
    border: `1px solid ${theme.palette.success.main}`,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(76, 175, 80, 0.05)'
        : 'rgba(76, 175, 80, 0.05)',
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
  placeholderImage: {
    height: 140,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      theme.palette.type === 'dark'
        ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[300]} 100%)`,
    color: theme.palette.text.secondary,
    opacity: 0.8,
  },
}));

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const PostsGridItem = (props: PostsGridItemProps) => {
  const { post, entity, allowRanking, onRankUpdate, collectionId } = props;
  const [views, setViews] = useState(post.views);
  const [score, setScore] = useState(post.score);
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
      setScore(lastSignal.score);
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setCommentsCount(lastSignal.commentsCount);
    }
  }, [lastSignal]);

  const [favicon, setFavicon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (post.type === 'link' && !post.headerImage && post.url) {
      qetaApi.fetchURLMetadata({ url: post.url }).then(res => {
        if (res.favicon) setFavicon(res.favicon);
      });
    }
  }, [post.type, post.headerImage, post.url, qetaApi]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const navigate = useNavigate();

  const route = selectByPostType(
    post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );

  const href = entity
    ? `${route({
        id: post.id.toString(10),
      })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  const renderHeaderMedia = () => {
    if (post.headerImage) {
      return (
        <CardMedia
          component="img"
          onError={e => (e.currentTarget.style.display = 'none')}
          height="140"
          image={post.headerImage}
          alt={post.title}
          style={{ objectFit: 'cover' }}
        />
      );
    }
    if (post.type === 'link') {
      return (
        <Box className={classes.placeholderImage}>
          {favicon ? (
            <img
              src={favicon}
              alt={post.title}
              style={{
                height: 64,
                width: 64,
                objectFit: 'contain',
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <LinkIcon style={{ fontSize: 60 }} />
          )}
        </Box>
      );
    }
    if (post.type === 'article') {
      return (
        <Box className={classes.placeholderImage}>
          <CollectionsBookmarkIcon style={{ fontSize: 60 }} />
        </Box>
      );
    }
    return null;
  };

  return (
    <Card className={classes.card}>
      <Box className={classes.iconsContainer}>
        {post.status === 'obsolete' && (
          <Tooltip title={t('common.obsolete', {})}>
            <ErrorOutlineIcon className={classes.obsoleteIcon} />
          </Tooltip>
        )}
        {post.favorite && (
          <Tooltip title={t('common.favorite')}>
            <StarIcon className={classes.starIcon} />
          </Tooltip>
        )}
      </Box>
      <CardActionArea
        component="a"
        href={href}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          navigate(href);
        }}
        aria-label={post.title}
        tabIndex={0}
        style={{
          outline: 'none',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        {renderHeaderMedia()}
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
              {post.type === 'link' && <FaviconItem entity={post} />}
              {post.title}
            </Typography>
            <Box display="flex" alignItems="center">
              <StatusChip status={post.status} />
              {post.type === 'link' && <OpenLinkButton entity={post} />}
            </Box>
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
              <Tooltip title={score >= 1000 ? score : ''} arrow>
                <Box className={classes.statBox}>
                  <Typography className={classes.statValue}>
                    {formatShortNumber(score)}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    {post.type !== 'link'
                      ? t('common.votes')
                      : t('common.clicks')}
                  </Typography>
                </Box>
              </Tooltip>
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
              <Tooltip title={commentsCount >= 1000 ? commentsCount : ''} arrow>
                <Box className={classes.statBox}>
                  <Typography className={classes.statValue}>
                    {formatShortNumber(commentsCount)}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    {t('common.comments').toLowerCase()}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Box className={classes.statsGroup}>
              <AuthorBox
                userEntityRef={post.author}
                time={getPostDisplayDate(post)}
                label=""
                anonymous={post.anonymous}
                compact
              />
            </Box>
          </Box>
          {allowRanking && (
            <RankingButtons
              postId={post.id}
              collectionId={collectionId}
              onRankUpdate={onRankUpdate}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
