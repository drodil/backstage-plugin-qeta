import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { CollectionFollowButton } from '../Buttons/CollectionFollowButton';
import { ClickableLink } from '../Utility/ClickableLink';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';

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
  const href = collectionRoute({ id: collection.id.toString(10) });

  return (
    <Card className={classes.card}>
      <ClickableLink href={href} ariaLabel={collection.title}>
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
            <Box
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CollectionFollowButton collection={collection} />
            </Box>
          </Box>
          {collection.description && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(collection.description), 200),
              )}
            </Typography>
          )}
          <Box mt={2}>
            <TagsAndEntities
              entity={collection}
              tagsLimit={5}
              entitiesLimit={5}
            />
          </Box>
          <Grid container spacing={1} className={classes.statsGrid}>
            <Grid item xs={3}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                className={classes.statItem}
              >
                <QuestionAnswerIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {collection.questionsCount}
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
                className={classes.statItem}
              >
                <DescriptionIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {collection.articlesCount}
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
                className={classes.statItem}
              >
                <LinkIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {collection.linksCount}
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
                className={classes.statItem}
              >
                <PeopleIcon fontSize="small" color="disabled" />
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {collection.followers}
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
  );
};
