import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef, userRouteRef } from '../../routes';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useStyles, useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';

export interface PostsGridItemProps {
  collection: Collection;
}

export const CollectionsGridItem = (props: PostsGridItemProps) => {
  const { collection } = props;
  const { t } = useTranslation();

  const collectionRoute = useRouteRef(collectionRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const styles = useStyles();
  const { name, initials, user } = useEntityAuthor(collection);
  const navigate = useNavigate();
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
        </CardContent>
      </CardActionArea>
      <CardContent style={{ paddingTop: '0.5rem', marginTop: 'auto' }}>
        <TagsAndEntities entity={collection} />
        <Box style={{ paddingLeft: '0.2rem', paddingTop: '0.5rem' }}>
          <Typography variant="caption">
            <Avatar
              src={user?.spec?.profile?.picture}
              className={styles.questionListItemAvatar}
              alt={name}
              variant="rounded"
            >
              {initials}
            </Avatar>
            {collection.owner === 'anonymous' ? (
              t('common.anonymousAuthor')
            ) : (
              <Link to={`${userRoute()}/${collection.owner}`}>{name}</Link>
            )}{' '}
            <Link to={href} className="qetaPostListItemQuestionBtn">
              <RelativeTimeWithTooltip value={collection.created} />
            </Link>
            {' · '}
            {t('common.posts', {
              count: collection.posts?.length ?? 0,
              itemType: 'post',
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
