import { CSSProperties } from 'react';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsNone from '@material-ui/icons/NotificationsNone';
import { useUserFollow } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const UserFollowButton = (props: {
  userRef: string;
  style?: CSSProperties;
}) => {
  const { userRef, style } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const users = useUserFollow();
  if (users.loading) {
    return null;
  }

  return (
    <Tooltip title={t('userButton.tooltip')}>
      <IconButton
        disableRipple
        size="small"
        color={users.isFollowingUser(userRef) ? 'secondary' : 'default'}
        onClick={() => {
          if (users.isFollowingUser(userRef)) {
            users.unfollowUser(userRef);
          } else {
            users.followUser(userRef);
          }
        }}
        style={style}
      >
        {users.isFollowingUser(userRef) ? (
          <NotificationsActive />
        ) : (
          <NotificationsNone />
        )}
      </IconButton>
    </Tooltip>
  );
};
