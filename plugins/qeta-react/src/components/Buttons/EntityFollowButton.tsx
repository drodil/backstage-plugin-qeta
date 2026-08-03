import { RiNotification3Fill, RiNotification3Line } from '@remixicon/react';
import { useEntityFollow } from '../../hooks';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const EntityFollowButton = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const entities = useEntityFollow();
  if (entities.loading) {
    return null;
  }
  const isFollowing = entities.isFollowingEntity(entityRef);

  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={t('entityButton.tooltip')}
        size="small"
        variant={isFollowing ? 'secondary' : 'tertiary'}
        onClick={e => e.preventDefault()}
        onPress={() => {
          if (isFollowing) {
            entities.unfollowEntity(entityRef);
          } else {
            entities.followEntity(entityRef);
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
      <Tooltip>{t('entityButton.tooltip')}</Tooltip>
    </TooltipTrigger>
  );
};
