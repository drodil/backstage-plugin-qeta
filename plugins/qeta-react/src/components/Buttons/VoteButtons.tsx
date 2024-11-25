import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import React from 'react';
import { useVoting } from '../../hooks/useVoting';
import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';

export type QetaVoteButtonsClassKey =
  | 'qetaCorrectAnswerSelected'
  | 'qetaCorrectAnswer'
  | 'voteButtonContainer';

const useStyles = makeStyles(
  (theme: Theme) =>
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
  { name: 'QetaVoteButtons' },
);

export const VoteButtons = (props: {
  entity: PostResponse | AnswerResponse;
  post?: PostResponse;
}) => {
  const {
    voteUpTooltip,
    ownVote,
    voteUp,
    score,
    voteDownTooltip,
    voteDown,
    correctAnswer,
    correctTooltip,
    toggleCorrectAnswer,
  } = useVoting(props.entity);
  const own = props.entity.own ?? false;
  const classes = useStyles();

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
      <Typography variant="h6" style={{ userSelect: 'none' }}>
        {score}
      </Typography>
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
        (props.post?.own || props.post?.canEdit || correctAnswer) && (
          <Box>
            <Tooltip title={correctTooltip}>
              <span>
                <IconButton
                  aria-label="mark correct"
                  size="small"
                  onClick={
                    props.post?.own || props.post?.canEdit
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
