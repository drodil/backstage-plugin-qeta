import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { removeMarkdownFormatting, truncate } from '../../utils/utils';
import { TagsAndEntities } from '../QuestionPage/TagsAndEntities';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  questionRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import {
  QetaSignal,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useEntityAuthor, useStyles, useTranslation } from '../../utils/hooks';
import { useSignal } from '@backstage/plugin-signals-react';

export interface QuestionListItemProps {
  question: QuestionResponse;
  entity?: string;
}

export const QuestionListItem = (props: QuestionListItemProps) => {
  const { question, entity } = props;

  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [answersCount, setAnswersCount] = useState(question.answersCount);
  const [score, setScore] = useState(question.score);
  const [views, setViews] = useState(question.views);
  const { t } = useTranslation();

  const { lastSignal } = useSignal<QetaSignal>(`qeta:question_${question.id}`);

  useEffect(() => {
    if (lastSignal?.type === 'question_stats') {
      setCorrectAnswer(lastSignal.correctAnswer);
      setAnswersCount(lastSignal.answersCount);
      setScore(lastSignal.score);
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  const questionRoute = useRouteRef(questionRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const theme = useTheme();
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(question);

  return (
    <Card className="qetaQuestionListItem">
      <CardContent>
        <Box className={styles.questionListItemStats}>
          <Typography
            display="block"
            variant="caption"
            className="qetaQuestionListItemScore"
          >
            {t('common.score', { score: score.toString(10) })}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            className={`qetaQuestionListItemAnswers ${
              correctAnswer
                ? 'qetaQuestionListItemCorrectAnswer'
                : 'quetaQuestionListItemNoCorrectAnswer'
            }`}
            style={{
              color: correctAnswer ? theme.palette.success.main : undefined,
            }}
          >
            {t('common.answers', {
              count: answersCount,
            })}
          </Typography>
          <Typography
            display="block"
            variant="caption"
            className="qetaQuestionListItemViews"
          >
            {t('common.viewsShort', {
              count: views,
            })}
          </Typography>
        </Box>
        <Box className={styles.questionListItemContent}>
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
        </Box>
      </CardContent>
    </Card>
  );
};
