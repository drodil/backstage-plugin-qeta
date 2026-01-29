import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { IconButton, Tooltip } from '@material-ui/core';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsNone from '@material-ui/icons/NotificationsNone';
import { Post } from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';

export const FollowPostButton = (props: { post: Post }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);
  const [following, setFollowing] = useState(post.following ?? false);

  const handleFollow = async () => {
    if (following) {
      await qetaApi.unfollowPost(post.id);
      setFollowing(false);
    } else {
      await qetaApi.followPost(post.id);
      setFollowing(true);
    }
  };

  return (
    <Tooltip
      title={
        following
          ? t('followPostButton.unfollow', {})
          : t('followPostButton.follow', {})
      }
    >
      <IconButton
        disableRipple
        size="small"
        color={following ? 'secondary' : 'default'}
        onClick={handleFollow}
      >
        {following ? <NotificationsActive /> : <NotificationsNone />}
      </IconButton>
    </Tooltip>
  );
};
