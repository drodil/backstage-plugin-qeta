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
import { useRouteRef } from '@backstage/core-plugin-api';
import { editArticleRouteRef } from '../../routes';
import DeleteIcon from '@material-ui/icons/Delete';
import { DeleteModal } from '../DeleteModal';
import EditIcon from '@material-ui/icons/Edit';
import { useVoting } from '../../hooks/useVoting';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useNavigate } from 'react-router-dom';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

  const own = props.post.own ?? false;

  return (
    <div className={styles.container}>
      <Grid container justifyContent="space-between">
        <Grid item>
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
          <Tooltip title={voteDownTooltip}>
            <span>
              <IconButton
                aria-label="vote down"
                color={ownVote < 0 ? 'primary' : 'default'}
                className={
                  ownVote < 0 ? 'qetaVoteDownSelected' : 'qetaVoteDown'
                }
                disabled={own}
                size="small"
                onClick={voteDown}
              >
                <ArrowDownward />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('common.score', { score: score.toString(10) })}>
            <Typography className={styles.scoreText} display="inline">
              {score}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item>
          <FavoriteButton entity={post} />
          <LinkButton entity={post} />
          {(post.canEdit || post.canDelete) && (
            <>
              {post.canEdit && (
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
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
};
