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
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useTranslation } from '../../hooks';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';

export interface PostsGridItemProps {
  collection: Collection;
}

export const CollectionsGridItem = (props: PostsGridItemProps) => {
  const { collection } = props;
  const { t } = useTranslation();

  const collectionRoute = useRouteRef(collectionRouteRef);
  const navigate = useNavigate();
  const collections = useCollectionsFollow();
  const href = collectionRoute({ id: collection.id.toString(10) });

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(href)}>
        {collection.headerImage && (
          <CardMedia
            component="img"
            height="140"
            image={collection.headerImage}
            alt={collection.title}
          />
        )}
        <CardContent style={{ paddingBottom: '0.5rem' }}>
          <Typography gutterBottom variant="h6" component="div">
            {collection.title}
          </Typography>
          {collection.description && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(collection.description), 200),
              )}
            </Typography>
          )}
          <Grid container>
            <Grid item xs={12}>
              <TagsAndEntities entity={collection} />
            </Grid>
            <Grid item>
              <Typography variant="caption">
                {t('common.posts', {
                  count: collection.postsCount,
                  itemType: 'post',
                })}
                {' · '}
                {t('common.followers', {
                  count: collection.followers,
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
      <CardContent style={{ marginTop: 'auto' }}>
        <Grid container justifyContent="center">
          <Grid item>
            <Tooltip title={t('collectionButton.tooltip')}>
              <Button
                size="small"
                variant="outlined"
                color={
                  collections.isFollowingCollection(collection)
                    ? 'secondary'
                    : 'primary'
                }
                onClick={() => {
                  if (collections.isFollowingCollection(collection)) {
                    collections.unfollowCollection(collection);
                  } else {
                    collections.followCollection(collection);
                  }
                }}
                startIcon={
                  collections.isFollowingCollection(collection) ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )
                }
              >
                {collections.isFollowingCollection(collection)
                  ? t('collectionButton.unfollow')
                  : t('collectionButton.follow')}
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
