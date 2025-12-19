import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Tooltip,
  Typography,
  Box,
  makeStyles,
  IconButton,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';

export interface PostsGridItemProps {
  collection: Collection;
}

const useStyles = makeStyles(theme => ({
  placeholderImage: {
    height: 140,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      theme.palette.type === 'dark'
        ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[300]} 100%)`,
    color: theme.palette.text.secondary,
    opacity: 0.8,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    position: 'relative',
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'currentColor',
      opacity: theme.palette.action.hoverOpacity || 0.04,
      borderRadius: theme.shape.borderRadius,
      pointerEvents: 'none',
    },
  },
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
}));

export const CollectionsGridItem = (props: PostsGridItemProps) => {
  const { collection } = props;
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const collectionRoute = useRouteRef(collectionRouteRef);
  const navigate = useNavigate();
  const collections = useCollectionsFollow();
  const href = collectionRoute({ id: collection.id.toString(10) });

  return (
    <Card className={classes.card} onClick={() => navigate(href)}>
      {collection.headerImage ? (
        <CardMedia
          component="img"
          height="140"
          onError={e => (e.currentTarget.style.display = 'none')}
          image={collection.headerImage}
          alt={collection.title}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Box className={classes.placeholderImage}>
          <PlaylistPlayIcon style={{ fontSize: 60 }} />
        </Box>
      )}
      <CardContent
        style={{
          paddingBottom: '0.5rem',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography gutterBottom variant="h6" component="div">
            {collection.title}
          </Typography>
          <Tooltip
            title={
              collections.isFollowingCollection(collection)
                ? t('collectionButton.unfollow')
                : t('collectionButton.follow')
            }
          >
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                if (collections.isFollowingCollection(collection)) {
                  collections.unfollowCollection(collection);
                } else {
                  collections.followCollection(collection);
                }
              }}
            >
              {collections.isFollowingCollection(collection) ? (
                <VisibilityOff />
              ) : (
                <Visibility />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        {collection.description && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(collection.description), 200),
            )}
          </Typography>
        )}
        <Box mt={2}>
          <TagsAndEntities entity={collection} />
        </Box>
        <Grid container spacing={1} className={classes.statsGrid}>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              className={classes.statItem}
            >
              <QuestionAnswerIcon fontSize="small" color="disabled" />
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                {collection.postsCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('common.postsLabel', {
                  count: collection.postsCount,
                  itemType: 'post',
                })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              className={classes.statItem}
            >
              <PeopleIcon fontSize="small" color="disabled" />
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                {collection.followers}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('common.followersLabel', { count: collection.followers })}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
