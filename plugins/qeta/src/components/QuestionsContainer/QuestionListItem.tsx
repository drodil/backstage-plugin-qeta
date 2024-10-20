import { Avatar, Chip, Grid, Typography, useTheme } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PostResponse,
  QetaSignal,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagsAndEntities } from '../QuestionPage/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  questionRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { useEntityAuthor, useStyles, useTranslation } from '../../utils/hooks';
import { useSignal } from '@backstage/plugin-signals-react';
import { VoteButtons } from '../QuestionPage/VoteButtons';
import { FavoriteButton } from '../QuestionPage/FavoriteButton';

export interface QuestionListItemProps {
  question: PostResponse;
  entity?: string;
}

export const QuestionListItem = (props: QuestionListItemProps) => {
  const { question, entity } = props;

  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [answersCount, setAnswersCount] = useState(question.answersCount);
  const [views, setViews] = useState(question.views);
  const { t } = useTranslation();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${question.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const theme = useTheme();
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(question);

  return (
    <Grid
      container
      spacing={0}
      className={styles.questionListItem}
      justifyContent="flex-start"
    >
      <Grid container item xs={1} justifyContent="center">
        <div className={styles.questionCardVote}>
          <VoteButtons entity={question} />
          <FavoriteButton entity={question} />
        </div>
      </Grid>
      <Grid item xs={11} className={styles.questionListItemContent}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Chip
              variant="outlined"
              size="small"
              label={t('common.answers', {
                count: answersCount,
              })}
              style={{
                borderColor: correctAnswer
                  ? theme.palette.success.main
                  : undefined,
                marginBottom: '0',
              }}
            />
            <Chip
              variant="outlined"
              size="small"
              style={{ border: 'none', marginBottom: '0' }}
              label={t('common.viewsShort', {
                count: views,
              })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" component="div">
              <Link
                to={
                  entity
                    ? `${questionRoute({
                        id: question.id.toString(10),
                      })}?entity=${entity}`
                    : questionRoute({ id: question.id.toString(10) })
                }
                className="qetaQuestionListItemQuestionBtn"
              >
                {question.title}
              </Link>
            </Typography>
            <Typography
              variant="caption"
              noWrap
              component="div"
              className="qetaQuestionListItemContent"
              style={{ marginBottom: '5px' }}
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(question.content), 150),
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TagsAndEntities question={question} />
            <Typography
              variant="caption"
              display="inline"
              className={`${styles.questionListItemAuthor} qetaQuestionListItemAuthor`}
            >
              <Avatar
                src={user?.spec?.profile?.picture}
                className={styles.questionListItemAvatar}
                alt={name}
                variant="rounded"
              >
                {initials}
              </Avatar>
              {question.author === 'anonymous' ? (
                t('common.anonymousAuthor')
              ) : (
                <Link to={`${userRoute()}/${question.author}`}>{name}</Link>
              )}{' '}
              <Link
                to={
                  entity
                    ? `${questionRoute({
                        id: question.id.toString(10),
                      })}?entity=${entity}`
                    : questionRoute({ id: question.id.toString(10) })
                }
                className="qetaQuestionListItemQuestionBtn"
              >
                {t('authorBox.askedAtTime')}{' '}
                <RelativeTimeWithTooltip value={question.created} />
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
