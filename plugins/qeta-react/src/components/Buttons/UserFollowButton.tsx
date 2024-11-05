import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useStyles, useTranslation, useUserFollow } from '../../hooks';

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
