import { useEntityFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Box,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';
import { entityRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';

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

const FollowedEntityItem = ({ entityRef }: { entityRef: string }) => {
  const classes = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);
  const href = entityRoute({ entityRef: entityRef });

  return (
    <ListItem
      dense
      button
      className={classes.listItem}
      component={Link}
      to={href}
    >
      <Box className={classes.iconBox}>
        {Icon ? <Icon fontSize="small" /> : null}
      </Box>
      <Tooltip title={primaryTitle ?? entityRef} arrow>
        <ListItemText
          primary={primaryTitle ?? entityRef}
          classes={{ primary: classes.listItemText }}
        />
      </Tooltip>
    </ListItem>
  );
};

export const FollowedEntitiesList = () => {
  const entities = useEntityFollow();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (entities.entities.length === 0 || entities.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedEntities')} limit={5} randomize>
        {entities.entities.map(entity => (
          <FollowedEntityItem key={entity} entityRef={entity} />
        ))}
      </RightList>
    </RightListContainer>
  );
};
