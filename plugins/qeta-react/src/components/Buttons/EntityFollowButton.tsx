import React from 'react';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useEntityFollow, useTranslation } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';

export const EntityFollowButton = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const { t } = useTranslation();
  const entities = useEntityFollow();
  if (entities.loading) {
    return null;
  }

  return (
    <Tooltip title={t('entityButton.tooltip')}>
      <IconButton
        disableRipple
        size="small"
        color={entities.isFollowingEntity(entityRef) ? 'secondary' : 'primary'}
        onClick={() => {
          if (entities.isFollowingEntity(entityRef)) {
            entities.unfollowEntity(entityRef);
          } else {
            entities.followEntity(entityRef);
          }
        }}
      >
        {entities.isFollowingEntity(entityRef) ? (
          <VisibilityOff />
        ) : (
          <Visibility />
        )}
      </IconButton>
    </Tooltip>
  );
};
