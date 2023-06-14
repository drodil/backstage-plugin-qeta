import { AnswerResponse, qetaApiRef, QuestionResponse } from '../../api';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import React from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';

export const VoteButtons = (props: {
  entity: QuestionResponse | AnswerResponse;
  question?: QuestionResponse;
}) => {
  const [ownVote, setOwnVote] = React.useState(props.entity.ownVote ?? 0);
  const analytics = useAnalytics();
  const isCorrectAnswer =
    'questionId' in props.entity ? props.entity.correct : false;
  const [correct, setCorrect] = React.useState(isCorrectAnswer);
  const [entity, setEntity] = React.useState<QuestionResponse | AnswerResponse>(
    props.entity,
  );
  const qetaApi = useApi(qetaApiRef);
  const theme = useTheme();
  const isQuestion = 'title' in entity;
  const own = props.entity.own ?? false;

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

  let correctTooltip = correct
    ? 'Mark answer as incorrect'
    : 'Mark answer as correct';
  if (!props.question?.own) {
    correctTooltip = correct ? 'This answer has been marked as correct' : '';
  }

  let voteUpTooltip = isQuestion
    ? 'This question is good'
    : 'This answer is good';
  if (own) {
    voteUpTooltip = isQuestion
      ? 'You cannot vote your own question'
      : 'You cannot vote your own answer';
  }

  let voteDownTooltip = isQuestion
    ? 'This question is not good'
    : 'This answer is not good';
  if (own) {
    voteDownTooltip = voteUpTooltip;
  }

  const toggleCorrectAnswer = () => {
    if (!('questionId' in entity)) {
      return;
    }
    if (correct) {
      qetaApi
        .markAnswerIncorrect(entity.questionId, entity.id)
        .then(response => {
          if (response) {
            setCorrect(false);
          }
        });
    } else {
      qetaApi.markAnswerCorrect(entity.questionId, entity.id).then(response => {
        setCorrect(response);
      });
    }
  };

  return (
    <React.Fragment>
      <Tooltip title={voteUpTooltip}>
        <span>
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
      <Typography variant="h6">{entity.score}</Typography>
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
      {'correct' in props.entity && (props.question?.own || correct) && (
        <Box>
          <Tooltip title={correctTooltip}>
            <span>
              <IconButton
                aria-label="mark correct"
                size="small"
                onClick={props.question?.own ? toggleCorrectAnswer : undefined}
              >
                <Check
                  className={
                    correct ? 'qetaCorrectAnswerSelected' : 'qetaCorrectAnswer'
                  }
                  style={{
                    color: correct ? theme.palette.success.main : undefined,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </React.Fragment>
  );
};
