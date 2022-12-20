import { AnswerResponse, qetaApiRef, QuestionResponse } from '../../api';
import { Box, IconButton, Tooltip, Typography } from '@material-ui/core';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';

export const VoteButtons = (props: {
  entity: QuestionResponse | AnswerResponse;
  question?: QuestionResponse;
}) => {
  const [ownVote, setOwnVote] = React.useState(props.entity.ownVote ?? 0);
  const isCorrectAnswer =
    'questionId' in props.entity ? props.entity.correct : false;
  const [correct, setCorrect] = React.useState(isCorrectAnswer);
  const [entity, setEntity] = React.useState<QuestionResponse | AnswerResponse>(
    props.entity,
  );
  const qetaApi = useApi(qetaApiRef);

  const voteUp = () => {
    if ('title' in entity) {
      qetaApi.voteQuestionUp(entity.id).then(response => {
        setOwnVote(1);
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerUp(entity.questionId, entity.id).then(response => {
        setOwnVote(1);
        setEntity(response);
      });
    }
  };

  const voteDown = () => {
    if ('title' in entity) {
      qetaApi.voteQuestionDown(entity.id).then(response => {
        setOwnVote(-1);
        setEntity(response);
      });
    } else if ('questionId' in entity) {
      qetaApi.voteAnswerDown(entity.questionId, entity.id).then(response => {
        setOwnVote(-1);
        setEntity(response);
      });
    }
  };

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
      <Tooltip
        title={
          props.entity.own
            ? 'You cannot vote your own post'
            : 'This answer is good'
        }
      >
        <IconButton
          aria-label="vote up"
          color={ownVote > 0 ? 'primary' : 'default'}
          disabled={props.entity.own ?? false}
          size="small"
          onClick={voteUp}
        >
          <ArrowUpward />
        </IconButton>
      </Tooltip>
      <Typography variant="h6">{entity.score}</Typography>
      <Tooltip
        title={
          props.entity.own
            ? 'You cannot vote your own post'
            : 'This answer is not good'
        }
      >
        <IconButton
          aria-label="vote down"
          color={ownVote < 0 ? 'primary' : 'default'}
          disabled={props.entity.own ?? false}
          size="small"
          onClick={voteDown}
        >
          <ArrowDownward />
        </IconButton>
      </Tooltip>
      {'correct' in props.entity && props.question?.own && (
        <Box>
          <Tooltip title="Mark answer as correct">
            <IconButton
              aria-label="mark correct"
              color={correct ? 'primary' : 'default'}
              size="small"
              onClick={toggleCorrectAnswer}
            >
              <Check />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </React.Fragment>
  );
};
