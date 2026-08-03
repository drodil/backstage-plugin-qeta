import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiNotification3Fill, RiNotification3Line } from '@remixicon/react';
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

  const tooltip = following
    ? t('followPostButton.unfollow', {})
    : t('followPostButton.follow', {});

  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={tooltip}
        size="small"
        variant={following ? 'secondary' : 'tertiary'}
        onPress={handleFollow}
        icon={
          following ? (
            <RiNotification3Fill size={16} />
          ) : (
            <RiNotification3Line size={16} />
          )
        }
      />
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  );
};
