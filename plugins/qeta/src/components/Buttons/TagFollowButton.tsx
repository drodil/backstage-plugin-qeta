import React from 'react';
import { useTagsFollow, useTranslation } from '../../utils/hooks';
import { Button, Tooltip } from '@material-ui/core';

export const TagFollowButton = (props: { tag: string }) => {
  const { tag } = props;
  const { t } = useTranslation();
  const tags = useTagsFollow();
  return (
    <Tooltip title={t('tagButton.tooltip')}>
      <Button
        color={tags.isFollowingTag(tag) ? 'secondary' : 'primary'}
        onClick={() => {
          if (tags.isFollowingTag(tag)) {
            tags.unfollowTag(tag);
          } else {
            tags.followTag(tag);
          }
        }}
      >
        {tags.isFollowingTag(tag)
          ? t('tagButton.unfollow')
          : t('tagButton.follow')}
      </Button>
    </Tooltip>
  );
};
