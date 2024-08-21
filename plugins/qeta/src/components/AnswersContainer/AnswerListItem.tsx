import { Avatar, Box, Card, CardContent, Typography } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import React from 'react';
import DOMPurify from 'dompurify';
import { removeMarkdownFormatting, truncate } from '../../utils/utils';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  questionRouteRef,
  userRouteRef,
} from '@drodil/backstage-plugin-qeta-react';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AnswerResponse } from '@drodil/backstage-plugin-qeta-common';
import { useEntityAuthor, useStyles, useTranslation } from '../../utils/hooks';
import { TagsAndEntities } from '../QuestionPage/TagsAndEntities';

export interface AnswerListItemProps {
  answer: AnswerResponse;
  entity?: string;
}

export const AnswerListItem = (props: AnswerListItemProps) => {
  const { answer, entity } = props;

  const questionRoute = useRouteRef(questionRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(answer);
  const { t } = useTranslation();

  const getAnswerLink = () => {
    return entity
      ? `${questionRoute({
          id: answer.questionId.toString(10),
        })}?entity=${entity}#answer_${answer.id}`
      : `${questionRoute({
          id: answer.questionId.toString(10),
        })}/#answer_${answer.id}`;
  };

  return (
    <Card className="qetaQuestionListItem">
      <CardContent>
        <Box className={styles.questionListItemStats}>
          <Typography
            display="block"
            variant="caption"
            className="qetaQuestionListItemScore"
          >
            {t('common.score', { score: answer.score.toString(10) })}
          </Typography>
        </Box>
        <Box className={styles.questionListItemContent}>
          <Typography variant="h5" component="div">
            <Link
              to={getAnswerLink()}
              className="qetaAnswerListItemQuestionBtn"
            >
              {t('answer.questionTitle', {
                question: answer.question?.title ?? '',
              })}
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
              truncate(removeMarkdownFormatting(answer.content), 150),
            )}
          </Typography>
          {answer.question && <TagsAndEntities question={answer.question} />}
          <Typography
            variant="caption"
            display="inline"
            className={`${styles.questionListItemAuthor} qetaAnswerListItemAuthor`}
          >
            <Avatar
              src={user?.spec?.profile?.picture}
              className={styles.questionListItemAvatar}
              alt={name}
              variant="rounded"
            >
              {initials}
            </Avatar>
            {answer.author === 'anonymous' ? (
              t('common.anonymousAuthor')
            ) : (
              <Link to={`${userRoute()}/${answer.author}`}>{name}</Link>
            )}{' '}
            <Link
              to={getAnswerLink()}
              className="qetaQuestionListItemQuestionBtn"
            >
              {`${t('answer.answeredTime')} `}
              <RelativeTimeWithTooltip value={answer.created} />
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
