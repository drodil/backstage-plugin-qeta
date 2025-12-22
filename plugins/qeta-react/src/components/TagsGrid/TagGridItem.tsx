import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { DeleteModal } from '../DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { useTooltipStyles } from '../../hooks/useTooltipStyles.ts';
import { ClickableLink } from '../Utility/ClickableLink';

const useStyles = makeStyles(theme => ({
  statsGrid: {
    marginTop: 'auto',
  },
  statItem: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const TagGridItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { tag, onTagEdit, isModerator } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useGridItemStyles();
  const localClasses = useStyles();
  const tooltipStyles = useTooltipStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = (
    _event: {},
    _reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    setAnchorEl(null);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const handleEditModalOpen = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event as any, 'backdropClick');
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    onTagEdit();
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event as any, 'backdropClick');
    setDeleteModalOpen(true);
  };
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    onTagEdit();
  };

  const href = tagRoute({ tag: tag.tag });

  return (
    <Grid item xs={12} sm={6} md={6} xl={4}>
      <Card className={classes.card}>
        <ClickableLink href={href} ariaLabel={tag.tag}>
          <Box
            className={classes.cardHeader}
            display="flex"
            alignItems="center"
          >
            <Avatar
              variant="rounded"
              className="avatar"
              style={{ marginRight: 16 }}
            >
              <LocalOfferIcon />
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Tooltip title={tag.tag} arrow>
                <Typography variant="h6" noWrap>
                  {tag.tag}
                </Typography>
              </Tooltip>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              flexShrink={0}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <TagFollowButton tag={tag.tag} />
              {tag.canEdit || tag.canDelete ? (
                <>
                  <IconButton aria-label="settings" onClick={handleMenuClick}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="tag-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    getContentAnchorEl={null}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    {tag.canEdit && (
                      <MenuItem
                        onClick={e => {
                          e.stopPropagation();
                          handleEditModalOpen(e);
                        }}
                      >
                        <ListItemIcon style={{ minWidth: '32px' }}>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t('tagButton.edit')} />
                      </MenuItem>
                    )}
                    {tag.canDelete && (
                      <MenuItem
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteModalOpen(e);
                        }}
                      >
                        <ListItemIcon style={{ minWidth: '32px' }}>
                          <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t('tagButton.delete')} />
                      </MenuItem>
                    )}
                  </Menu>
                </>
              ) : null}
            </Box>
          </Box>
          <CardContent
            className={`${classes.cardContent} ${localClasses.flexColumn}`}
          >
            {tag.description && (
              <Box mb={2}>
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
              </Box>
            )}

            <Grid container spacing={1} className={localClasses.statsGrid}>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <QuestionAnswerIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {tag.questionsCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('common.questions')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <DescriptionIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {tag.articlesCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('common.articles')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <LinkIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {tag.linksCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('common.links')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <PeopleIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {tag.followerCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('common.followersPlain')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </ClickableLink>
      </Card>
      <EditTagModal
        tag={tag}
        open={editModalOpen}
        onClose={handleEditModalClose}
        isModerator={isModerator}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        entity={tag}
      />
    </Grid>
  );
};
