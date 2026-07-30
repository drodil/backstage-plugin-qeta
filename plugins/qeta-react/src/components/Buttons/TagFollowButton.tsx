import { RiNotification3Fill, RiNotification3Line } from '@remixicon/react';
import { useTagsFollow } from '../../hooks';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const TagFollowButton = (props: { tag: string }) => {
  const { tag } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const tags = useTagsFollow();
  if (tags.loading) {
    return null;
  }
  const isFollowing = tags.isFollowingTag(tag);
  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={t('tagButton.tooltip')}
        size="small"
        variant={isFollowing ? 'secondary' : 'tertiary'}
        onPress={() => {
          if (isFollowing) {
            tags.unfollowTag(tag);
          } else {
            tags.followTag(tag);
          }
        }}
        icon={
          isFollowing ? (
            <RiNotification3Fill size={16} />
          ) : (
            <RiNotification3Line size={16} />
          )
        }
      />
      <Tooltip>{t('tagButton.tooltip')}</Tooltip>
    </TooltipTrigger>
  );
};
