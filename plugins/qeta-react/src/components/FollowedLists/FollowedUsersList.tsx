import { useUserFollow } from '../../hooks';
import { useUserInfo } from '../../hooks/useEntityAuthor';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Avatar,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useNavigate } from 'react-router-dom';
import { userRouteRef } from '../../routes';
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
  avatar: {
    width: 24,
    height: 24,
    fontSize: '0.75rem',
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
  },
}));

const FollowedUserItem = ({ entityRef }: { entityRef: string }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const userRoute = useRouteRef(userRouteRef);
  const { name, initials, user } = useUserInfo(entityRef);

  return (
    <ListItem
      dense
      button
      className={classes.listItem}
      onClick={() => navigate(`${userRoute()}/${entityRef}`)}
    >
      <Avatar
        src={user?.spec?.profile?.picture}
        alt={name}
        className={classes.avatar}
      >
        {initials}
      </Avatar>
      <Tooltip title={name ?? entityRef} arrow>
        <ListItemText
          primary={name ?? entityRef}
          classes={{ primary: classes.listItemText }}
        />
      </Tooltip>
    </ListItem>
  );
};

export const FollowedUsersList = () => {
  const users = useUserFollow();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (users.users.length === 0 || users.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedUsers')}>
        {users.users.map(user => (
          <FollowedUserItem key={user} entityRef={user} />
        ))}
      </RightList>
    </RightListContainer>
  );
};
