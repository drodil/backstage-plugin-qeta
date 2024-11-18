import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useEntityFollow, useStyles, useTranslation } from '../../hooks';

export const EntityFollowButton = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const styles = useStyles();
  const { t } = useTranslation();
  const entities = useEntityFollow();
  if (entities.loading) {
    return null;
  }

  return (
    <Tooltip title={t('entityButton.tooltip')}>
      <IconButton
        size="small"
        className={`${styles.marginLeft} qetaFollowEntityBtn`}
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
