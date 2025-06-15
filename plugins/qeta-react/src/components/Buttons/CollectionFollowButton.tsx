import { CSSProperties } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
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
  return (
    <Tooltip title={t('collectionButton.tooltip')}>
      <IconButton
        size="small"
        color={
          collections.isFollowingCollection(collection)
            ? 'secondary'
            : 'primary'
        }
        onClick={() => {
          if (collections.isFollowingCollection(collection)) {
            collections.unfollowCollection(collection);
          } else {
            collections.followCollection(collection);
          }
        }}
        style={style}
      >
        {collections.isFollowingCollection(collection) ? (
          <VisibilityOff />
        ) : (
          <Visibility />
        )}
      </IconButton>
    </Tooltip>
  );
};
