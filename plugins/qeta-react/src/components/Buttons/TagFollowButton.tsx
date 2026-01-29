import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsNone from '@material-ui/icons/NotificationsNone';
import { useTagsFollow } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const TagFollowButton = (props: { tag: string }) => {
  const { tag } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const tags = useTagsFollow();
  if (tags.loading) {
    return null;
  }
  return (
    <Tooltip title={t('tagButton.tooltip')}>
      <IconButton
        disableRipple
        size="small"
        color={tags.isFollowingTag(tag) ? 'secondary' : 'default'}
        onClick={() => {
          if (tags.isFollowingTag(tag)) {
            tags.unfollowTag(tag);
          } else {
            tags.followTag(tag);
          }
        }}
      >
        {tags.isFollowingTag(tag) ? (
          <NotificationsActive />
        ) : (
          <NotificationsNone />
        )}
      </IconButton>
    </Tooltip>
  );
};
