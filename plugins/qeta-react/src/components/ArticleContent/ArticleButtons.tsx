import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { ReactElement, useState } from 'react';
import { Flex, ButtonIcon, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiDeleteBinLine,
  RiEditLine,
  RiArrowGoBackLine,
} from '@remixicon/react';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { LinkButton } from '../Buttons/LinkButton';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { editArticleRouteRef } from '../../routes';
import { DeleteModal } from '../Modals';
import { useVoting } from '../../hooks/useVoting';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useNavigate } from 'react-router-dom';
import { useIsModerator } from '../../hooks';
import { qetaApiRef } from '../../api.ts';
import styles from './ArticleButtons.module.css';

export const ArticleButtons = (props: { post: PostResponse }) => {
  const { post } = props;
  const { voteUpTooltip, ownVote, voteUp, score, voteDownTooltip, voteDown } =
    useVoting(post);
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();
  const editArticleRoute = useRouteRef(editArticleRouteRef);
  const { isModerator } = useIsModerator();
  const qetaApi = useApi(qetaApiRef);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const alertApi = useApi(alertApiRef);

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

  const restoreArticle = async () => {
    qetaApi
      .restorePost(post.id)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(() => {
        window.location.reload();
      });
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
        </Flex>
        <Flex align="center" gap="1">
          <FavoriteButton entity={post} />
          <LinkButton entity={post} />
          {post.canEdit && post.status !== 'obsolete' && (
            <TooltipTrigger>
              <ButtonIcon
                aria-label={t('articlePage.editButton')}
                size="small"
                variant="tertiary"
                onPress={() =>
                  navigate(
                    editArticleRoute({
                      id: post.id.toString(10),
                    }),
                  )
                }
                icon={<RiEditLine size={16} />}
              />
              <Tooltip>{t('articlePage.editButton')}</Tooltip>
            </TooltipTrigger>
          )}
          {post.canDelete && (
            <>
              <TooltipTrigger>
                <ButtonIcon
                  aria-label={t('articlePage.deleteButton')}
                  size="small"
                  variant="tertiary"
                  onPress={handleDeleteModalOpen}
                  icon={<RiDeleteBinLine size={16} />}
                />
                <Tooltip>{t('articlePage.deleteButton')}</Tooltip>
              </TooltipTrigger>
              <DeleteModal
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
                entity={post}
              />
            </>
          )}
          {isModerator && post.status === 'deleted' && (
            <TooltipTrigger>
              <ButtonIcon
                aria-label={t('articlePage.restoreButton')}
                size="small"
                variant="tertiary"
                onPress={() => restoreArticle()}
                icon={<RiArrowGoBackLine size={16} />}
              />
              <Tooltip>{t('articlePage.restoreButton')}</Tooltip>
            </TooltipTrigger>
          )}
        </Flex>
      </Flex>
    </div>
  );
};
