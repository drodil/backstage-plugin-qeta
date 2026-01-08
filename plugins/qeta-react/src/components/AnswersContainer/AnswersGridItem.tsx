import { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AnswerResponse,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { questionRouteRef } from '../../routes';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import numeral from 'numeral';
import ThumbUp from '@material-ui/icons/ThumbUp';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { AuthorBox } from '../AuthorBox/AuthorBox';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { ClickableLink } from '../Utility/ClickableLink';

export interface AnswersGridItemProps {
  answer: AnswerResponse;
  entity?: string;
}

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    position: 'relative',
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'currentColor',
      opacity: theme.palette.action.hoverOpacity || 0.04,
      borderRadius: theme.shape.borderRadius,
      pointerEvents: 'none',
    },
  },
  contentContainer: {
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2,
  },
  content: {
    color: theme.palette.text.secondary,
    margin: theme.spacing(1, 0),
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.9rem',
    flexGrow: 1,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: 'auto',
  },
  metaContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  metaItemActive: {
    color: theme.palette.success.main,
  },
  metaIcon: {
    fontSize: 18,
  },
}));

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const AnswersGridItem = (props: AnswersGridItemProps) => {
  const { answer, entity } = props;
  const [score] = useState(answer.score);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();

  const questionRoute = useRouteRef(questionRouteRef);

  const href = entity
    ? `${questionRoute({
        id: answer.postId.toString(10),
      })}?entity=${entity}#answer_${answer.id}`
    : `${questionRoute({
        id: answer.postId.toString(10),
      })}#answer_${answer.id}`;

  return (
    <Card className={classes.card}>
      <ClickableLink href={href} ariaLabel={answer.post?.title ?? ''}>
        <CardContent className={classes.contentContainer}>
          <Typography component="div" className={classes.title}>
            {t('answer.questionTitle', {
              question: answer.post?.title ?? '',
            })}
          </Typography>

          <Typography
            variant="body2"
            component="div"
            className={classes.content}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  truncate(removeMarkdownFormatting(answer.content), 200),
                ),
              }}
            />
          </Typography>

          <div className={classes.footer}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <div className={classes.metaContainer}>
                <Tooltip title={t('common.votesCount', { count: score })} arrow>
                  <div className={classes.metaItem}>
                    <ThumbUp className={classes.metaIcon} />
                    <span>{formatShortNumber(score)}</span>
                  </div>
                </Tooltip>
                {answer.correct && (
                  <Tooltip title={t('authorBox.correctAnswer')} arrow>
                    <div
                      className={`${classes.metaItem} ${classes.metaItemActive}`}
                    >
                      <CheckCircle className={classes.metaIcon} />
                    </div>
                  </Tooltip>
                )}
              </div>
              <AuthorBox
                userEntityRef={answer.author}
                time={answer.created}
                label={t('answer.answeredTime')}
                anonymous={answer.anonymous}
                compact
              />
            </Box>
            {answer.post && (
              <Box display="flex" flexWrap="wrap" style={{ gap: '4px' }}>
                <TagsAndEntities entity={answer.post} />
              </Box>
            )}
          </div>
        </CardContent>
      </ClickableLink>
    </Card>
  );
};
