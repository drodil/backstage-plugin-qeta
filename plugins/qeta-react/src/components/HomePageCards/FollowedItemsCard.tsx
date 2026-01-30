import { Fragment } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import {
  tagRouteRef,
  userRouteRef,
  collectionRouteRef,
  entityRouteRef,
} from '../../routes';
import {
  useTagsFollow,
  useEntityFollow,
  useUserFollow,
  useCollectionsFollow,
} from '../../hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Link } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import {
  EntityTooltip,
  UserTooltip,
  TagTooltip,
  CollectionTooltip,
} from '../Tooltips';
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CategoryIcon from '@material-ui/icons/Category';
import NotificationsActive from '@material-ui/icons/NotificationsActive';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: theme.spacing(2, 2, 1, 2),
  },
  content: {
    padding: theme.spacing(0, 2, 2, 2),
    flexGrow: 1,
    overflow: 'auto',
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  sectionTitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  list: {
    padding: 0,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  iconBox: {
    minWidth: 24,
    maxWidth: 24,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  avatar: {
    width: 20,
    height: 20,
    fontSize: '0.65rem',
  },
  emptyMessage: {
    color: theme.palette.text.disabled,
    fontStyle: 'italic',
    padding: theme.spacing(2, 0),
    textAlign: 'center',
  },
  entityText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const EntityItem = ({ entityRef }: { entityRef: string }) => {
  const classes = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);

  return (
    <EntityTooltip
      entity={entityRef}
      interactive={false}
      enterDelay={400}
      enterNextDelay={400}
      placement="left"
    >
      <ListItem
        button
        component={Link}
        to={entityRoute({ entityRef })}
        className={classes.listItem}
      >
        <Box className={classes.iconBox}>
          {Icon ? (
            <Icon fontSize="small" />
          ) : (
            <CategoryIcon style={{ fontSize: 14 }} />
          )}
        </Box>
        <ListItemText
          primary={primaryTitle ?? entityRef}
          classes={{ primary: classes.entityText }}
        />
      </ListItem>
    </EntityTooltip>
  );
};

export const FollowedItemsCard = () => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const { tags, loading: tagsLoading } = useTagsFollow();
  const { entities, loading: entitiesLoading } = useEntityFollow();
  const { users, userEntities, loading: usersLoading } = useUserFollow();
  const { collections, loading: collectionsLoading } = useCollectionsFollow();

  const tagRoute = useRouteRef(tagRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const collectionRoute = useRouteRef(collectionRouteRef);

  const isLoading =
    tagsLoading || entitiesLoading || usersLoading || collectionsLoading;

  const hasAnyItems =
    tags.length > 0 ||
    entities.length > 0 ||
    users.length > 0 ||
    collections.length > 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box>
          {[1, 2, 3].map(row => (
            <Fragment key={row}>
              <Skeleton
                variant="text"
                width="40%"
                style={{ marginTop: 16, marginBottom: 8 }}
              />
              <List dense>
                {[1, 2].map(i => (
                  <ListItem key={i} className={classes.listItem}>
                    <Skeleton
                      variant="circle"
                      width={20}
                      height={20}
                      style={{ marginRight: 8 }}
                    />
                    <Skeleton variant="text" width="60%" />
                  </ListItem>
                ))}
              </List>
            </Fragment>
          ))}
        </Box>
      );
    }

    if (!hasAnyItems) {
      return (
        <Typography className={classes.emptyMessage}>
          {t('homePage.noFollowedItems')}
        </Typography>
      );
    }

    return (
      <>
        {tags.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              {t('homePage.tags')}
            </Typography>
            <List className={classes.list} dense>
              {tags.slice(0, 5).map(tag => (
                <TagTooltip
                  key={tag}
                  tag={tag}
                  interactive={false}
                  enterDelay={400}
                  enterNextDelay={400}
                  placement="left"
                >
                  <ListItem
                    button
                    component={Link}
                    to={tagRoute({ tag })}
                    className={classes.listItem}
                  >
                    <Box className={classes.iconBox}>
                      <LocalOfferOutlined style={{ fontSize: 14 }} />
                    </Box>
                    <ListItemText primary={tag} />
                  </ListItem>
                </TagTooltip>
              ))}
            </List>
          </>
        )}

        {entities.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              {t('homePage.entities')}
            </Typography>
            <List className={classes.list} dense>
              {entities.slice(0, 5).map(entity => (
                <EntityItem key={entity} entityRef={entity} />
              ))}
            </List>
          </>
        )}

        {users.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              {t('homePage.users')}
            </Typography>
            <List className={classes.list} dense>
              {users.slice(0, 5).map(user => {
                const entity = userEntities.get(user);
                const displayName = entity?.spec?.profile?.displayName ?? user;
                const initials = (displayName ?? '')
                  .replace(/[^a-zA-Z]/g, '')
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                return (
                  <UserTooltip
                    key={user}
                    entityRef={user}
                    interactive={false}
                    enterDelay={400}
                    enterNextDelay={400}
                    placement="left"
                  >
                    <ListItem
                      button
                      component={Link}
                      to={`${userRoute()}/${user}`}
                      className={classes.listItem}
                    >
                      <ListItemAvatar style={{ minWidth: 32 }}>
                        <Avatar
                          alt={user}
                          src={entity?.spec?.profile?.picture}
                          className={classes.avatar}
                        >
                          {initials || user.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={displayName} />
                    </ListItem>
                  </UserTooltip>
                );
              })}
            </List>
          </>
        )}

        {collections.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              {t('homePage.collections')}
            </Typography>
            <List className={classes.list} dense>
              {collections.slice(0, 5).map(collection => (
                <CollectionTooltip
                  key={collection.id}
                  collectionId={collection.id}
                  interactive={false}
                  enterDelay={400}
                  enterNextDelay={400}
                  placement="left"
                >
                  <ListItem
                    button
                    component={Link}
                    to={collectionRoute({ id: collection.id.toString() })}
                    className={classes.listItem}
                  >
                    <Box className={classes.iconBox}>
                      <LibraryBooks style={{ fontSize: 14 }} />
                    </Box>
                    <ListItemText primary={collection.title} />
                  </ListItem>
                </CollectionTooltip>
              ))}
            </List>
          </>
        )}
      </>
    );
  };

  return (
    <Card className={classes.root} variant="outlined">
      <CardHeader
        title={t('homePage.followedItems')}
        className={classes.header}
        avatar={<NotificationsActive />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent className={classes.content}>{renderContent()}</CardContent>
    </Card>
  );
};
