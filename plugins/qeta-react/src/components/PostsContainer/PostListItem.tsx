import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { useSignal } from '@backstage/plugin-signals-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Chip, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import numeral from 'numeral';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import LinkIcon from '@material-ui/icons/Link';
import StarIcon from '@material-ui/icons/Star';
import Visibility from '@material-ui/icons/Visibility';
import CheckCircle from '@material-ui/icons/CheckCircle';
import ThumbUp from '@material-ui/icons/ThumbUp';
import TouchApp from '@material-ui/icons/TouchApp';
import { StatusChip } from '../Utility/StatusChip';
import { OpenLinkButton } from '../Buttons/OpenLinkButton.tsx';
import { FaviconItem } from '../FaviconItem';
import { getPostDisplayDate } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';

export interface PostListItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
  showTypeLabel?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: '100%',
    padding: theme.spacing(2.5, 2, 2, 2),
    minHeight: 80,
    transition: 'all 0.2s ease-in-out',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      '& $title': {
        color: theme.palette.primary.main,
      },
    },
    cursor: 'pointer',
  },
  metaCol: {
    minWidth: 64,
    maxWidth: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1.5),
    gap: theme.spacing(0.75),
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    width: '100%',
    fontSize: '15px',
  },
  metaItemActive: {
    color: theme.palette.success.main,
    fontWeight: 500,
  },
  metaItemWarning: {
    color: theme.palette.warning.main,
    fontWeight: 500,
  },
  metaIcon: {
    fontSize: 16,
  },
  title: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    textDecoration: 'none',
  },
  content: {
    color: theme.palette.text.primary,
    opacity: 0.9,
    margin: '4px 0 8px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.95rem',
    minHeight: '20px',
  },
  tagsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  authorBoxContainer: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
  },
  typeLabel: {
    marginLeft: theme.spacing(1),
    height: 24,
  },
}));

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const PostListItem = (props: PostListItemProps) => {
  const { post, entity, showTypeLabel } = props;
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [views, setViews] = useState(post.views);
  const [score, setScore] = useState(post.score);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();
  const navigate = useNavigate();
  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  const route = selectByPostType(
    post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );

  const href = entity
    ? `${route({ id: post.id.toString(10) })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    navigate(href);
  };

  /* eslint-disable no-nested-ternary */
  const answerClassName = correctAnswer
    ? styles.metaItemActive
    : answersCount === 0
    ? styles.metaItemWarning
    : '';
  /* eslint-enable no-nested-ternary */

  return (
    <Box className={styles.root} onClick={handleClick}>
      <Box className={styles.metaCol} aria-label={t('common.postStats')}>
        <Tooltip
          title={
            post.type === 'link'
              ? t('common.clicksCount', { count: score })
              : t('common.votesCount', { count: score })
          }
          arrow
        >
          <Box className={styles.metaItem}>
            {post.type === 'link' ? (
              <TouchApp className={styles.metaIcon} />
            ) : (
              <ThumbUp className={styles.metaIcon} />
            )}
            <Typography variant="caption" style={{ fontSize: 'inherit' }}>
              {formatShortNumber(score)}
            </Typography>
          </Box>
        </Tooltip>

        {post.type === 'question' && (
          <Tooltip
            title={t('common.answersCount', { count: answersCount })}
            arrow
          >
            <Box className={`${styles.metaItem} ${answerClassName}`}>
              {correctAnswer ? (
                <CheckCircle className={styles.metaIcon} />
              ) : (
                <QuestionAnswer className={styles.metaIcon} />
              )}
              <Typography variant="caption" style={{ fontSize: 'inherit' }}>
                {formatShortNumber(answersCount)}
              </Typography>
            </Box>
          </Tooltip>
        )}

        <Tooltip title={t('common.viewsCount', { count: views })} arrow>
          <Box className={styles.metaItem}>
            <Visibility className={styles.metaIcon} />
            <Typography variant="caption" style={{ fontSize: 'inherit' }}>
              {formatShortNumber(views)}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      <Box className={styles.contentContainer}>
        <Box className={styles.titleContainer}>
          <Box className={styles.titleWrapper}>
            {post.type === 'link' && <FaviconItem entity={post} />}
            <Typography component="div" className={styles.title}>
              {post.title}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
            {post.favorite && (
              <Tooltip title="Favorite">
                <StarIcon style={{ color: '#FFB400', fontSize: 20 }} />
              </Tooltip>
            )}
            <StatusChip status={post.status} />
            {showTypeLabel && post.type && (
              <Chip
                size="small"
                variant="outlined"
                icon={selectByPostType(
                  post.type,
                  <QuestionAnswer style={{ fontSize: 16 }} />,
                  <CollectionsBookmarkIcon style={{ fontSize: 16 }} />,
                  <LinkIcon style={{ fontSize: 16 }} />,
                )}
                label={capitalizeFirstLetter(t(`common.${post.type}`))}
                className={styles.typeLabel}
              />
            )}
            {post.type === 'link' && <OpenLinkButton entity={post} />}
          </Box>
        </Box>

        <Typography variant="body2" component="div" className={styles.content}>
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(post.content), 200),
              ),
            }}
          />
        </Typography>

        <Box className={styles.tagsRow}>
          <Box className={styles.tags}>
            <TagsAndEntities entity={post} />
          </Box>
          <Box className={styles.authorBoxContainer}>
            <AuthorBox
              userEntityRef={post.author}
              time={getPostDisplayDate(post)}
              label={t('authorBox.postedAtTime')}
              expert={Boolean(post.experts && post.experts.length > 0)}
              anonymous={post.anonymous}
              compact
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
