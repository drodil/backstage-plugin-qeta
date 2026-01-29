import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsNone from '@material-ui/icons/NotificationsNone';
import { useEntityFollow } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const EntityFollowButton = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const entities = useEntityFollow();
  if (entities.loading) {
    return null;
  }

  return (
    <Tooltip title={t('entityButton.tooltip')}>
      <IconButton
        disableRipple
        size="small"
        color={entities.isFollowingEntity(entityRef) ? 'secondary' : 'default'}
        onClick={() => {
          if (entities.isFollowingEntity(entityRef)) {
            entities.unfollowEntity(entityRef);
          } else {
            entities.followEntity(entityRef);
          }
        }}
      >
        {entities.isFollowingEntity(entityRef) ? (
          <NotificationsActive />
        ) : (
          <NotificationsNone />
        )}
      </IconButton>
    </Tooltip>
  );
};
