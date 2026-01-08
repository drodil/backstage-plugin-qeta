import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import {
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { LinkButton } from '../Buttons/LinkButton';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { editArticleRouteRef } from '../../routes';
import DeleteIcon from '@material-ui/icons/Delete';
import { DeleteModal } from '../Modals';
import EditIcon from '@material-ui/icons/Edit';
import RestoreIcon from '@material-ui/icons/Restore';
import { useVoting } from '../../hooks/useVoting';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useNavigate } from 'react-router-dom';
import { useIsModerator } from '../../hooks';
import { qetaApiRef } from '../../api.ts';

export type QetaArticleButtonsClassKey = 'container' | 'scoreText';

export const useLocalStyles = makeStyles(
  theme => {
    return {
      container: {
        width: '100%',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        borderTop: `1px solid ${theme.palette.background.paper}`,
        borderBottom: `1px solid ${theme.palette.background.paper}`,
      },
      scoreText: {
        marginLeft: '0.5rem',
        userSelect: 'none',
      },
    };
  },
  { name: 'QetaArticleButtons' },
);

export const ArticleButtons = (props: { post: PostResponse }) => {
  const { post } = props;
  const { voteUpTooltip, ownVote, voteUp, score, voteDownTooltip, voteDown } =
    useVoting(post);
  const styles = useLocalStyles();
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

  return (
    <div className={styles.container}>
      <Grid container justifyContent="space-between">
        <Grid item>
          <Tooltip title={getVoteUpTooltip()}>
            <span>
              <IconButton
                aria-label="vote up"
                color={ownVote > 0 ? 'primary' : 'default'}
                className={ownVote > 0 ? 'qetaVoteUpSelected' : 'qetaVoteUp'}
                disabled={isDisabled()}
                size="small"
                onClick={voteUp}
                data-testid={`vote-up-btn-${
                  ownVote > 0 ? 'selected' : 'unselected'
                }`}
              >
                <ArrowUpward />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={getVoteDownTooltip()}>
            <span>
              <IconButton
                aria-label="vote down"
                color={ownVote < 0 ? 'primary' : 'default'}
                className={
                  ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'
                }
                disabled={isDisabled()}
                size="small"
                onClick={voteDown}
                data-testid={`vote-down-btn-${
                  ownVote < 0 ? 'selected' : 'unselected'
                }`}
              >
                <ArrowDownward />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('common.score', { score: score.toString(10) })}>
            <Typography
              className={styles.scoreText}
              display="inline"
              data-testid="vote-count"
            >
              {score}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item>
          <FavoriteButton entity={post} />
          <LinkButton entity={post} />
          {post.canEdit && post.status !== 'obsolete' && (
            <Tooltip title={t('articlePage.editButton')}>
              <IconButton
                size="small"
                onClick={() =>
                  navigate(
                    editArticleRoute({
                      id: post.id.toString(10),
                    }),
                  )
                }
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {post.canDelete && (
            <>
              <Tooltip title={t('articlePage.deleteButton')}>
                <IconButton
                  size="small"
                  onClick={handleDeleteModalOpen}
                  color="secondary"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <DeleteModal
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
                entity={post}
              />
            </>
          )}
          {isModerator && post.status === 'deleted' && (
            <Tooltip title={t('articlePage.restoreButton')}>
              <IconButton
                size="small"
                onClick={() => restoreArticle()}
                color="primary"
              >
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </div>
  );
};
