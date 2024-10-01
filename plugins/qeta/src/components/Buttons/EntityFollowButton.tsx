import React from 'react';
import { useEntityFollow, useStyles, useTranslation } from '../../utils/hooks';
import { Button, Tooltip } from '@material-ui/core';

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
        {entities.isFollowingEntity(entityRef)
          ? t('entityButton.unfollow')
          : t('entityButton.follow')}
      </Button>
    </Tooltip>
  );
};
