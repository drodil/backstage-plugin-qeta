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
import { useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { useTagsFollow } from '../../hooks';
import { DeleteModal } from '../DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { useTooltipStyles } from '../../hooks/useTooltipStyles.ts';

export const TagGridItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { tag, onTagEdit, isModerator } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(qetaTranslationRef);
  const tags = useTagsFollow();
  const classes = useGridItemStyles();
  const tooltipStyles = useTooltipStyles();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const handleEditModalOpen = () => setEditModalOpen(true);
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    onTagEdit();
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    onTagEdit();
  };

  return (
    <Grid item xs={12} sm={6} md={4} xl={3}>
      <Card className={classes.card} variant="outlined">
        <CardActionArea onClick={() => navigate(tagRoute({ tag: tag.tag }))}>
          <CardHeader
            className={classes.cardHeader}
            title={<span className={classes.ellipsis}>{tag.tag}</span>}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent className={classes.cardContent}>
            <Typography className={classes.stats} variant="caption">
              {t('common.posts', { count: tag.postsCount, itemType: 'post' })}
              {' · '}
              {t('common.followers', { count: tag.followerCount })}
            </Typography>
            {tag.experts && tag.experts.length > 0 && (
              <Typography className={classes.experts} variant="caption">
                {t('common.experts')}
                {': '}
                {tag.experts.map((e, i) => (
                  <>
                    <EntityRefLink key={e} entityRef={e} />
                    {i === tag.experts!.length - 1 ? '' : ', '}
                  </>
                ))}
              </Typography>
            )}
            {tag.description && (
              <Tooltip
                title={tag.description}
                arrow
                classes={{
                  tooltip: tooltipStyles.tooltip,
                  arrow: tooltipStyles.tooltipArrow,
                }}
              >
                <Typography className={classes.description} variant="body2">
                  {DOMPurify.sanitize(
                    truncate(removeMarkdownFormatting(tag.description), 80),
                  )}
                </Typography>
              </Tooltip>
            )}
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Grid container justifyContent="center" spacing={1}>
            <Grid item>
              <Tooltip title={t('tagButton.tooltip')}>
                <Button
                  className={classes.actionButton}
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
            {tag.canEdit && (
              <Grid item>
                <Button
                  className={classes.actionButton}
                  size="small"
                  onClick={handleEditModalOpen}
                  variant="outlined"
                  startIcon={<EditIcon />}
                >
                  {t('tagButton.edit')}
                </Button>
              </Grid>
            )}
            {tag.canDelete && (
              <Grid item>
                <Button
                  className={classes.actionButton}
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
        isModerator={isModerator}
      />
    </Grid>
  );
};
