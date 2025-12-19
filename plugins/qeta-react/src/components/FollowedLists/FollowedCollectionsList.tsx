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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const collectionRoute = useRouteRef(collectionRouteRef);

  if (collections.collections.length === 0 || collections.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedCollections')}>
        {collections.collections.map(collection => (
          <ListItem
            key={collection.id}
            dense
            button
            className={classes.listItem}
            onClick={() =>
              navigate(collectionRoute({ id: collection.id.toString(10) }))
            }
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
        ))}
      </RightList>
    </RightListContainer>
  );
};
