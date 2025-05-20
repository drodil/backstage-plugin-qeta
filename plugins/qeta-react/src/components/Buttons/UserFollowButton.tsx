import { CSSProperties } from 'react';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
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
        color={users.isFollowingUser(userRef) ? 'secondary' : 'primary'}
        onClick={() => {
          if (users.isFollowingUser(userRef)) {
            users.unfollowUser(userRef);
          } else {
            users.followUser(userRef);
          }
        }}
        style={style}
      >
        {users.isFollowingUser(userRef) ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Tooltip>
  );
};
