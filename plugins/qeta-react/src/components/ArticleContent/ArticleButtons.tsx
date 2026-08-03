import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { ReactElement } from 'react';
import { ButtonIcon, Flex, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { LinkButton } from '../Buttons/LinkButton';
import { useVoting } from '../../hooks/useVoting';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './ArticleButtons.module.css';

export const ArticleButtons = (props: { post: PostResponse }) => {
  const { post } = props;
  const { voteUpTooltip, ownVote, voteUp, score, voteDownTooltip, voteDown } =
    useVoting(post);
  const { t } = useTranslationRef(qetaTranslationRef);

  const own = props.post.own ?? false;

  const isDisabled = () => {
    return own || post.status !== 'active';
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
    <div className={styles.container}>
      <Flex justify="between" align="center">
        <Flex align="center" gap="1">
          {withTooltip(
            <ButtonIcon
              aria-label="vote up"
              variant={ownVote > 0 ? 'secondary' : 'tertiary'}
              className={ownVote > 0 ? 'qetaVoteUpSelected' : 'qetaVoteUp'}
              isDisabled={isDisabled()}
              size="small"
              onPress={voteUp}
              data-testid={`vote-up-btn-${
                ownVote > 0 ? 'selected' : 'unselected'
              }`}
              icon={<RiArrowUpLine size={16} />}
            />,
            getVoteUpTooltip(),
          )}
          {withTooltip(
            <Text
              as="span"
              variant="title-small"
              className={styles.scoreText}
              data-testid="vote-count"
            >
              {score}
            </Text>,
            t('common.score', { score: score.toString(10) }),
          )}
          {withTooltip(
            <ButtonIcon
              aria-label="vote down"
              variant={ownVote < 0 ? 'secondary' : 'tertiary'}
              className={ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'}
              isDisabled={isDisabled()}
              size="small"
              onPress={voteDown}
              data-testid={`vote-down-btn-${
                ownVote < 0 ? 'selected' : 'unselected'
              }`}
              icon={<RiArrowDownLine size={16} />}
            />,
            getVoteDownTooltip(),
          )}
        </Flex>
        <Flex align="center" gap="1">
          <FavoriteButton entity={post} />
          <LinkButton entity={post} />
        </Flex>
      </Flex>
    </div>
  );
};
