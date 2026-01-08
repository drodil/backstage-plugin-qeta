import { useState } from 'react';
import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { DeleteModal } from '../Modals';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';

import { useListItemStyles } from '../../hooks';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  tagName: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statsWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
    gap: theme.spacing(1),
  },
}));

export const TagListItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { tag, onTagEdit, isModerator } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();
  const listItemClasses = useListItemStyles();

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
    <>
      <Link to={href} className={listItemClasses.root}>
        <LocalOfferIcon className={classes.icon} />
        <Box className={classes.content}>
          <Box className={classes.header}>
            <Typography className={classes.tagName}>{tag.tag}</Typography>
          </Box>
          {tag.description && (
            <Typography className={classes.description}>
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(tag.description), 100),
              )}
            </Typography>
          )}
        </Box>

        <Box className={classes.statsWrapper}>
          <Tooltip title={t('common.questions')} arrow>
            <div className={classes.statItem}>
              <QuestionAnswerIcon fontSize="small" />
              <Typography variant="body2">{tag.questionsCount}</Typography>
            </div>
          </Tooltip>
          <Tooltip title={t('common.articles')} arrow>
            <div className={classes.statItem}>
              <DescriptionIcon fontSize="small" />
              <Typography variant="body2">{tag.articlesCount}</Typography>
            </div>
          </Tooltip>
          <Tooltip title={t('common.links')} arrow>
            <div className={classes.statItem}>
              <LinkIcon fontSize="small" />
              <Typography variant="body2">{tag.linksCount}</Typography>
            </div>
          </Tooltip>
          <Tooltip title={t('common.followersPlain')} arrow>
            <div className={classes.statItem}>
              <PeopleIcon fontSize="small" />
              <Typography variant="body2">{tag.followerCount}</Typography>
            </div>
          </Tooltip>
        </Box>

        <Box
          className={classes.actions}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <TagFollowButton tag={tag.tag} />
          {tag.canEdit || tag.canDelete ? (
            <>
              <IconButton
                aria-label="settings"
                onClick={handleMenuClick}
                size="small"
              >
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
      </Link>
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
    </>
  );
};
