import React from 'react';
import { useEntityFollow, useStyles, useTranslation } from '../../utils/hooks';
import { Button, Tooltip } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
      <Button
        size="small"
        className={`${styles.marginRight} qetaFollowEntityBtn`}
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
      </Button>
    </Tooltip>
  );
};
