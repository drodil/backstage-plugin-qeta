import {
  AnswerResponse,
  QetaSignal,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import React, { useEffect, useState } from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useSignal } from '@backstage/plugin-signals-react';
import { useTranslation } from '../../utils/hooks';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    qetaCorrectAnswerSelected: {
      color: theme.palette.success.main,
    },
    qetaCorrectAnswer: {
      color: theme.palette.grey[500],
    },
    voteButtonContainer: {
      borderWidth: '1px',
      borderColor: 'white',
    },
  }),
);

export const VoteButtons = (props: {
  entity: QuestionResponse | AnswerResponse;
  question?: QuestionResponse;
}) => {
  const [entity, setEntity] = React.useState<QuestionResponse | AnswerResponse>(
    props.entity,
  );
  const [ownVote, setOwnVote] = React.useState(props.entity.ownVote ?? 0);
  const [correctAnswer, setCorrectAnswer] = useState(
    'questionId' in props.entity ? props.entity.correct : false,
  );
  const [score, setScore] = useState(entity.score);
  const analytics = useAnalytics();
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();

  const isQuestion = 'title' in entity;
  const own = props.entity.own ?? false;
  const classes = useStyles();

  const { lastSignal } = useSignal<QetaSignal>(
    isQuestion ? `qeta:question_${entity.id}` : `qeta:answer_${entity.id}`,
  );

  useEffect(() => {
    if (entity) {
      setScore(entity.score);
    }
  }, [entity]);

  useEffect(() => {
    if (
      lastSignal?.type === 'question_stats' ||
      lastSignal?.type === 'answer_stats'
    ) {
      setCorrectAnswer(lastSignal.correctAnswer);
      setScore(lastSignal.score);
    }
  }, [lastSignal]);

  const voteUp = () => {
    if (isQuestion) {
      qetaApi.voteQuestionUp(entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'question', { value: 1 });
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerUp(entity.questionId, entity.id).then(response => {
        setOwnVote(1);
        analytics.captureEvent('vote', 'answer', { value: 1 });
        setEntity(response);
      });
    }
  };

  const voteDown = () => {
    if (isQuestion) {
      qetaApi.voteQuestionDown(entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'question', { value: -1 });
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerDown(entity.questionId, entity.id).then(response => {
        setOwnVote(-1);
        analytics.captureEvent('vote', 'answer', { value: -1 });
        setEntity(response);
      });
    }
  };

  let correctTooltip: string = correctAnswer
    ? t('voteButtons.answer.markIncorrect')
    : t('voteButtons.answer.markCorrect');
  if (!props.question?.own) {
    correctTooltip = correctAnswer ? t('voteButtons.answer.marked') : '';
  }

  let voteUpTooltip: string = isQuestion
    ? t('voteButtons.question.good')
    : t('voteButtons.answer.good');
  if (own) {
    voteUpTooltip = isQuestion
      ? t('voteButtons.question.own')
      : t('voteButtons.answer.own');
  }

  let voteDownTooltip: string = isQuestion
    ? t('voteButtons.question.bad')
    : t('voteButtons.answer.bad');
  if (own) {
    voteDownTooltip = voteUpTooltip;
  }

  const toggleCorrectAnswer = () => {
    if (!('questionId' in entity)) {
      return;
    }
    if (correctAnswer) {
      qetaApi
        .markAnswerIncorrect(entity.questionId, entity.id)
        .then(response => {
          if (response) {
            setCorrectAnswer(false);
          }
        });
    } else {
      qetaApi.markAnswerCorrect(entity.questionId, entity.id).then(response => {
        if (response) {
          setCorrectAnswer(true);
        }
      });
    }
  };

  return (
    <React.Fragment>
      <Tooltip title={voteUpTooltip}>
        <span className={classes.voteButtonContainer}>
          <IconButton
            aria-label="vote up"
            color={ownVote > 0 ? 'primary' : 'default'}
            className={ownVote > 0 ? 'qetaVoteUpSelected' : 'qetaVoteUp'}
            disabled={own}
            size="small"
            onClick={voteUp}
          >
            <ArrowUpward />
          </IconButton>
        </span>
      </Tooltip>
      <Typography variant="h6">{score}</Typography>
      <Tooltip title={voteDownTooltip}>
        <span>
          <IconButton
            aria-label="vote down"
            color={ownVote < 0 ? 'primary' : 'default'}
            className={ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'}
            disabled={own}
            size="small"
            onClick={voteDown}
          >
            <ArrowDownward />
          </IconButton>
        </span>
      </Tooltip>
      {'correct' in props.entity &&
        (props.question?.own || props.question?.canEdit || correctAnswer) && (
          <Box>
            <Tooltip title={correctTooltip}>
              <span>
                <IconButton
                  aria-label="mark correct"
                  size="small"
                  onClick={
                    props.question?.own || props.question?.canEdit
                      ? toggleCorrectAnswer
                      : undefined
                  }
                >
                  <Check
                    className={
                      correctAnswer
                        ? classes.qetaCorrectAnswerSelected
                        : classes.qetaCorrectAnswer
                    }
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
    </React.Fragment>
  );
};
