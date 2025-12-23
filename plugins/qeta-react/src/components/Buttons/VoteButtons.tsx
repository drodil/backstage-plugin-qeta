import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import { Fragment } from 'react';
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

  const isDisabled = (isCorrectButton = false) => {
    // Check if parent post is obsolete (for answers)
    if (props.post?.status === 'obsolete') {
      return true;
    }
    if (isCorrectButton) {
      return 'status' in props.entity && props.entity.status !== 'active';
    }
    return (
      own ||
      ('status' in props.entity &&
        props.entity.status !== 'active' &&
        props.entity.status !== 'obsolete') ||
      ('status' in props.entity && props.entity.status === 'obsolete')
    );
  };

  const getVoteUpTooltip = () => {
    if (isDisabled()) {
      return '';
    }
    return voteUpTooltip;
  };

  const getVoteDownTooltip = () => {
    if (isDisabled()) {
      return '';
    }
    return voteDownTooltip;
  };

  const getCorrectTooltip = () => {
    if (isDisabled(true)) {
      return '';
    }
    return correctTooltip;
  };

  return (
    <Fragment>
      <Tooltip title={getVoteUpTooltip()}>
        <span>
          <IconButton
            aria-label="vote up"
            color={ownVote > 0 ? 'primary' : 'default'}
            className={ownVote > 0 ? 'qetaVoteUpSelected' : 'qetaVoteUp'}
            disabled={isDisabled()}
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
      <Tooltip title={getVoteDownTooltip()}>
        <span>
          <IconButton
            aria-label="vote down"
            color={ownVote < 0 ? 'primary' : 'default'}
            className={ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'}
            disabled={isDisabled()}
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
            <Tooltip title={getCorrectTooltip()}>
              <span>
                <IconButton
                  aria-label="mark correct"
                  size="small"
                  disabled={isDisabled(true)}
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
    </Fragment>
  );
};
