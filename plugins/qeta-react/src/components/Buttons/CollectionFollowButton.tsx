import { CSSProperties } from 'react';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiNotification3Fill, RiNotification3Line } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';

export const CollectionFollowButton = (props: {
  collection: Collection;
  style?: CSSProperties;
}) => {
  const { collection, style } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const collections = useCollectionsFollow();
  if (collections.loading) {
    return null;
  }
  const isFollowing = collections.isFollowingCollection(collection);
  return (
    <TooltipTrigger>
      <ButtonIcon
        aria-label={t('collectionButton.tooltip')}
        size="small"
        variant={isFollowing ? 'secondary' : 'tertiary'}
        onPress={() => {
          if (isFollowing) {
            collections.unfollowCollection(collection);
          } else {
            collections.followCollection(collection);
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
      <Tooltip>{t('collectionButton.tooltip')}</Tooltip>
    </TooltipTrigger>
  );
};
