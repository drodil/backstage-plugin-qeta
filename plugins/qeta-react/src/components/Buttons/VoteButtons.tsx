import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import React from 'react';
import { useVoting } from '../../hooks/useVoting';

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
                    sx={{
                      color: correctAnswer ? 'success.main' : 'text.primary',
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
