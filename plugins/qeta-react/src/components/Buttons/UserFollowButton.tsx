import React from 'react';
import { useStyles, useTranslation, useUserFollow } from '../../utils/hooks';
import { IconButton, Tooltip } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

export const UserFollowButton = (props: { userRef: string }) => {
  const { userRef } = props;
  const styles = useStyles();
  const { t } = useTranslation();
  const users = useUserFollow();
  if (users.loading) {
    return null;
  }

  return (
    <Tooltip title={t('userButton.tooltip')}>
      <IconButton
        size="small"
        className={`${styles.marginLeft} qetaFollowUserBtn`}
        color={users.isFollowingUser(userRef) ? 'secondary' : 'primary'}
        onClick={() => {
          if (users.isFollowingUser(userRef)) {
            users.unfollowUser(userRef);
          } else {
            users.followUser(userRef);
          }
        }}
      >
        {users.isFollowingUser(userRef) ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Tooltip>
  );
};
