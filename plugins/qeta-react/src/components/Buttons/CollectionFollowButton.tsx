import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from '../../hooks';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';

export const CollectionFollowButton = (props: { collection: Collection }) => {
  const { collection } = props;
  const { t } = useTranslation();
  const collections = useCollectionsFollow();
  if (collections.loading) {
    return null;
  }
  return (
    <Tooltip title={t('collectionButton.tooltip')}>
      <IconButton
        sx={{ marginLeft: 2 }}
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
