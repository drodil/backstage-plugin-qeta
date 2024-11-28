import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { useIsModerator, useTagsFollow, useTranslation } from '../../hooks';
import { DeleteModal } from '../DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

export const TagGridItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
}) => {
  const { tag, onTagEdit } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tags = useTagsFollow();
  const { isModerator } = useIsModerator();

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const handleEditModalOpen = () => setEditModalOpen(true);
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    onTagEdit();
  };

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    onTagEdit();
  };

  return (
    <Grid item xs={4}>
      <Card
        variant="outlined"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardActionArea onClick={() => navigate(tagRoute({ tag: tag.tag }))}>
          <CardHeader title={tag.tag} />
          <CardContent>
            <Typography variant="caption">
              {t('common.posts', { count: tag.postsCount, itemType: 'post' })}
              {' · '}
              {t('common.followers', { count: tag.followerCount })}
            </Typography>
            <Typography variant="body2">
              {' '}
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(tag.description ?? ''), 150),
              )}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions style={{ marginTop: 'auto' }}>
          <Grid container justifyContent="center">
            <Grid item>
              <Tooltip title={t('tagButton.tooltip')}>
                <Button
                  size="small"
                  variant="outlined"
                  color={tags.isFollowingTag(tag.tag) ? 'secondary' : 'primary'}
                  onClick={() => {
                    if (tags.isFollowingTag(tag.tag)) {
                      tags.unfollowTag(tag.tag);
                    } else {
                      tags.followTag(tag.tag);
                    }
                  }}
                  startIcon={
                    tags.isFollowingTag(tag.tag) ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )
                  }
                >
                  {tags.isFollowingTag(tag.tag)
                    ? t('tagButton.unfollow')
                    : t('tagButton.follow')}
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Button
                size="small"
                onClick={handleEditModalOpen}
                variant="outlined"
                startIcon={<EditIcon />}
              >
                {t('tagButton.edit')}
              </Button>
            </Grid>
            {isModerator && (
              <Grid item>
                <Button
                  size="small"
                  onClick={handleDeleteModalOpen}
                  variant="contained"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                >
                  {t('tagButton.delete')}
                </Button>
                <DeleteModal
                  open={deleteModalOpen}
                  onClose={handleDeleteModalClose}
                  entity={tag}
                />
              </Grid>
            )}
          </Grid>
        </CardActions>
      </Card>
      <EditTagModal
        tag={tag}
        open={editModalOpen}
        onClose={handleEditModalClose}
      />
    </Grid>
  );
};
