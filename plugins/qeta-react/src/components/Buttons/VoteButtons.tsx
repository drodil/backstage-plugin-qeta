import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RiArrowDownLine, RiArrowUpLine, RiCheckLine } from '@remixicon/react';
import { Fragment, ReactElement } from 'react';
import { useVoting } from '../../hooks/useVoting';
import { Box, ButtonIcon, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import styles from './VoteButtons.module.css';

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

  const withTooltip = (element: ReactElement, tooltip: string) =>
    tooltip ? (
      <TooltipTrigger>
        {element}
        <Tooltip>{tooltip}</Tooltip>
      </TooltipTrigger>
    ) : (
      element
    );

  return (
    <Fragment>
      {withTooltip(
        <ButtonIcon
          aria-label="vote up"
          variant={ownVote > 0 ? 'secondary' : 'tertiary'}
          className={ownVote > 0 ? 'qetaVoteUpSelected' : 'qetaVoteUp'}
          isDisabled={isDisabled()}
          size="small"
          data-testid={`vote-up-btn-${ownVote > 0 ? 'selected' : 'unselected'}`}
          onPress={voteUp}
          icon={<RiArrowUpLine size={16} />}
        />,
        getVoteUpTooltip(),
      )}
      <Text
        variant="title-small"
        className={styles.voteCount}
        data-testid="vote-count"
      >
        {score}
      </Text>
      {withTooltip(
        <ButtonIcon
          aria-label="vote down"
          variant={ownVote < 0 ? 'secondary' : 'tertiary'}
          className={ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'}
          isDisabled={isDisabled()}
          size="small"
          data-testid={`vote-down-btn-${
            ownVote < 0 ? 'selected' : 'unselected'
          }`}
          onPress={voteDown}
          icon={<RiArrowDownLine size={16} />}
        />,
        getVoteDownTooltip(),
      )}
      {'correct' in props.entity &&
        (props.post?.own || props.post?.canEdit || correctAnswer) && (
          <Box>
            {withTooltip(
              <ButtonIcon
                aria-label="mark correct"
                size="small"
                variant="tertiary"
                isDisabled={isDisabled(true)}
                data-testid={`mark-correct-answer-btn-${
                  correctAnswer ? 'checked' : 'unchecked'
                }`}
                onPress={
                  props.post?.own || props.post?.canEdit
                    ? toggleCorrectAnswer
                    : undefined
                }
                icon={
                  <RiCheckLine
                    size={16}
                    className={
                      correctAnswer
                        ? styles.correctAnswerSelected
                        : styles.correctAnswer
                    }
                  />
                }
              />,
              getCorrectTooltip(),
            )}
          </Box>
        )}
    </Fragment>
  );
};
