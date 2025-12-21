import { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AnswerResponse,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { questionRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import numeral from 'numeral';
import ThumbUp from '@material-ui/icons/ThumbUp';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { AuthorBox } from '../AuthorBox/AuthorBox';

export interface AnswerListItemProps {
  answer: AnswerResponse;
  entity?: string;
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
}));

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const AnswerListItem = (props: AnswerListItemProps) => {
  const { answer, entity } = props;
  const [score] = useState(answer.score);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();
  const navigate = useNavigate();

  const questionRoute = useRouteRef(questionRouteRef);

  const href = entity
    ? `${questionRoute({
        id: answer.postId.toString(10),
      })}?entity=${entity}#answer_${answer.id}`
    : `${questionRoute({
        id: answer.postId.toString(10),
      })}#answer_${answer.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    navigate(href);
  };

  return (
    <Box className={styles.root} onClick={handleClick}>
      <Box className={styles.metaCol} aria-label={t('common.postStats')}>
        <Tooltip title={t('common.votesCount', { count: score })} arrow>
          <Box className={styles.metaItem}>
            <ThumbUp className={styles.metaIcon} />
            <Typography variant="caption" style={{ fontSize: 'inherit' }}>
              {formatShortNumber(score)}
            </Typography>
          </Box>
        </Tooltip>
        {answer.correct && (
          <Tooltip title={t('authorBox.correctAnswer')} arrow>
            <Box className={`${styles.metaItem} ${styles.metaItemActive}`}>
              <CheckCircle className={styles.metaIcon} />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box className={styles.contentContainer}>
        <Box className={styles.titleContainer}>
          <Box className={styles.titleWrapper}>
            <Typography component="div" className={styles.title}>
              {t('answer.questionTitle', {
                question: answer.post?.title ?? '',
              })}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" component="div" className={styles.content}>
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(answer.content), 200),
              ),
            }}
          />
        </Typography>

        <Box className={styles.tagsRow}>
          <Box className={styles.tags}>
            {answer.post && <TagsAndEntities entity={answer.post} />}
          </Box>
          <Box className={styles.authorBoxContainer}>
            <AuthorBox
              userEntityRef={answer.author}
              time={answer.created}
              label={t('answer.answeredTime')}
              anonymous={answer.anonymous}
              compact
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
