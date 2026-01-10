import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Box,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import PlaylistPlayOutlined from '@material-ui/icons/PlaylistPlayOutlined';
import { Link } from 'react-router-dom';
import { collectionRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    minHeight: 28,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  listItemText: {
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  iconBox: {
    minWidth: 28,
    maxWidth: 28,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
}));

export const FollowedCollectionsList = () => {
  const collections = useCollectionsFollow();
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();
  const collectionRoute = useRouteRef(collectionRouteRef);

  if (collections.collections.length === 0 || collections.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedCollections')} limit={5} randomize>
        {collections.collections.map(collection => {
          const href = collectionRoute({ id: collection.id.toString(10) });
          return (
            <ListItem
              key={collection.id}
              dense
              button
              className={classes.listItem}
              component={Link}
              to={href}
            >
              <Box className={classes.iconBox}>
                <PlaylistPlayOutlined fontSize="small" />
              </Box>
              <Tooltip title={collection.title} arrow>
                <ListItemText
                  primary={collection.title}
                  classes={{ primary: classes.listItemText }}
                />
              </Tooltip>
            </ListItem>
          );
        })}
      </RightList>
    </RightListContainer>
  );
};
