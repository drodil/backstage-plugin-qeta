import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useTagsFollow, useTranslation } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';

export const TagFollowButton = (props: { tag: string }) => {
  const { tag } = props;
  const { t } = useTranslation();
  const tags = useTagsFollow();
  if (tags.loading) {
    return null;
  }
  return (
    <Tooltip title={t('tagButton.tooltip')}>
      <IconButton
        disableRipple
        size="small"
        color={tags.isFollowingTag(tag) ? 'secondary' : 'primary'}
        onClick={() => {
          if (tags.isFollowingTag(tag)) {
            tags.unfollowTag(tag);
          } else {
            tags.followTag(tag);
          }
        }}
      >
        {tags.isFollowingTag(tag) ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Tooltip>
  );
};
