import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import React from 'react';
import { useVoting } from '../../hooks/useVoting';

export type QetaVoteButtonsClassKey =
  | 'qetaCorrectAnswerSelected'
  | 'qetaCorrectAnswer'
  | 'voteButtonContainer';

const useStyles = makeStyles(
  theme =>
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
