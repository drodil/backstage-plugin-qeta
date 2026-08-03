import { CSSProperties } from 'react';
import { RiNotification3Fill, RiNotification3Line } from '@remixicon/react';
import { useUserFollow } from '../../hooks';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
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
  const isFollowing = users.isFollowingUser(userRef);

  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={t('userButton.tooltip')}
        size="small"
        variant={isFollowing ? 'secondary' : 'tertiary'}
        onPress={() => {
          if (isFollowing) {
            users.unfollowUser(userRef);
          } else {
            users.followUser(userRef);
          }
        }}
        style={style}
        icon={
          isFollowing ? (
            <RiNotification3Fill size={16} />
          ) : (
            <RiNotification3Line size={16} />
          )
        }
      />
      <Tooltip>{t('userButton.tooltip')}</Tooltip>
    </TooltipTrigger>
  );
};
