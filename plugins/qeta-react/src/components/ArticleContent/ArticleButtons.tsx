import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { LinkButton } from '../Buttons/LinkButton';
import { useRouteRef } from '@backstage/core-plugin-api';
import { editArticleRouteRef } from '../../routes';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteModal } from '../DeleteModal';
import EditIcon from '@mui/icons-material/Edit';
import { useVoting } from '../../hooks/useVoting';
import { useTranslation } from '../../hooks';
import { styled } from '@mui/system';

const ArticleButtonContainer = styled('div', {
  name: 'QetaArticleButtonContainer',
})(({ theme }) => ({
  width: '100%',
  paddingTop: '0.5em',
  paddingBottom: '0.5em',
  borderTop: `1px solid ${theme.palette.background.paper}`,
  borderBottom: `1px solid ${theme.palette.background.paper}`,
}));

export const ArticleButtons = (props: { post: PostResponse }) => {
  const { post } = props;
  const { voteUpTooltip, ownVote, voteUp, score, voteDownTooltip, voteDown } =
    useVoting(post);
  const { t } = useTranslation();
  const editArticleRoute = useRouteRef(editArticleRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

  const own = props.post.own ?? false;

  return (
    <ArticleButtonContainer>
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
            <Typography
              sx={{ marginLeft: '0.5em', userSelect: 'none' }}
              display="inline"
            >
              {score}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item>
          <FavoriteButton entity={post} />
          <LinkButton entity={post} />
          {(post.canEdit || post.canDelete) && (
            <>
              {post.canDelete && (
                <>
                  <Tooltip title={t('articlePage.deleteButton')}>
                    <IconButton size="small" onClick={handleDeleteModalOpen}>
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
              {post.canEdit && (
                <Tooltip title={t('articlePage.editButton')}>
                  <IconButton
                    size="small"
                    href={editArticleRoute({
                      id: post.id.toString(10),
                    })}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </ArticleButtonContainer>
  );
};
