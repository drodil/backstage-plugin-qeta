import { Link } from '@backstage/core-components';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PostResponse,
  PostType,
  QetaSignal,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { useSignal } from '@backstage/plugin-signals-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  makeStyles,
  Typography,
  useTheme,
  Box,
  Tooltip,
} from '@material-ui/core';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import numeral from 'numeral';

export interface PostListItemProps {
  post: PostResponse;
  entity?: string;
  type?: PostType;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing(0.5, 2, 2, 2),
    minHeight: 64,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& $title': {
        color: theme.palette.primary.main,
        '& a': {
          textDecoration: 'underline',
        },
      },
    },
  },
  metaCol: {
    minWidth: 55,
    maxWidth: 55,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 16,
    gap: 8,
  },
  metaBox: {
    width: 55,
    textAlign: 'center',
    borderRadius: 6,
    padding: '6px 0',
    fontWeight: 600,
    fontSize: '1rem',
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    lineHeight: 1.1,
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
  title: {
    fontWeight: 700,
    fontSize: '1.18rem',
    color: theme.palette.text.primary,
    marginBottom: 2,
    marginTop: 0,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
  content: {
    fontSize: '0.98rem',
    color: theme.palette.text.secondary,
    margin: '2px 0 4px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: 2,
    justifyContent: 'flex-end',
  },
  tags: {
    marginTop: 2,
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    flex: '1 1 0',
    minWidth: 0,
  },
  tagsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  authorBoxContainer: {
    flex: '0 0 220px',
    width: 220,
    minWidth: 220,
    maxWidth: 220,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'stretch',
    flexDirection: 'column',
    height: '100%',
  },
}));

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const PostListItem = (props: PostListItemProps) => {
  const { post, entity } = props;
  const [correctAnswer, setCorrectAnswer] = useState(post.correctAnswer);
  const [answersCount, setAnswersCount] = useState(post.answersCount);
  const [views, setViews] = useState(post.views);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();
  const theme = useTheme();
  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${post.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);

  const route = post.type === 'question' ? questionRoute : articleRoute;
  const href = entity
    ? `${route({ id: post.id.toString(10) })}?entity=${entity}`
    : route({ id: post.id.toString(10) });

  return (
    <Box className={styles.root}>
      <Box className={styles.metaCol} aria-label={t('common.postStats')}>
        <Tooltip title={post.score >= 1000 ? post.score : ''} arrow>
          <Box
            className={styles.metaBox}
            aria-label={t('common.votesCount', { count: post.score })}
          >
            {formatShortNumber(post.score)}
            <div
              style={{
                fontWeight: 400,
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            >
              {t('common.votes')}
            </div>
          </Box>
        </Tooltip>
        <Box
          className={
            correctAnswer
              ? `${styles.metaBox} ${styles.answersBoxAnswered}`
              : `${styles.metaBox} ${styles.answersBox}`
          }
          aria-label={t('common.answersCount', { count: answersCount })}
        >
          <Tooltip title={answersCount >= 1000 ? answersCount : ''} arrow>
            <span>{formatShortNumber(answersCount)}</span>
          </Tooltip>
          <div style={{ fontWeight: 400, fontSize: '0.75rem' }}>
            {t('common.answers')}
          </div>
        </Box>
        <Tooltip title={views >= 1000 ? views : ''} arrow>
          <Box
            className={styles.metaBox}
            aria-label={t('common.viewsCount', { count: views })}
          >
            {formatShortNumber(views)}
            <div
              style={{
                fontWeight: 400,
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            >
              {t('common.views')}
            </div>
          </Box>
        </Tooltip>
      </Box>
      <Box className={styles.contentContainer}>
        <Typography component="div" className={styles.title}>
          <Link
            to={href}
            className="qetaPostListItemQuestionBtn"
            aria-label={post.title}
            tabIndex={0}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {post.title}
          </Link>
        </Typography>
        <Typography variant="body2" component="div" className={styles.content}>
          <Link
            to={href}
            style={{ color: 'inherit', textDecoration: 'none' }}
            aria-label={t('common.readMore')}
          >
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(post.content), 150),
            )}
          </Link>
        </Typography>
        <Box className={styles.tagsRow}>
          <Box className={styles.tags}>
            <TagsAndEntities entity={post} />
          </Box>
          <Box className={styles.authorBoxContainer}>
            <AuthorBox
              userEntityRef={post.author}
              time={post.created}
              label={t('authorBox.postedAtTime')}
              expert={Boolean(post.experts && post.experts.length > 0)}
              anonymous={post.anonymous}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
