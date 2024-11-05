import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CardHeader from '@mui/material/CardHeader';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { useTagsFollow, useTranslation } from '../../hooks';

export const TagGridItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
}) => {
  const { tag, onTagEdit } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tags = useTagsFollow();

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const handleEditModalOpen = () => setEditModalOpen(true);
  const handleEditModalClose = () => {
    setEditModalOpen(false);
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
              >
                {t('tagButton.edit')}
              </Button>
            </Grid>
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
