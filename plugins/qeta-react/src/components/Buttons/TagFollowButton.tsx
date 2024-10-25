import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useStyles, useTagsFollow, useTranslation } from '../../hooks';

export const TagFollowButton = (props: { tag: string }) => {
  const { tag } = props;
  const styles = useStyles();
  const { t } = useTranslation();
  const tags = useTagsFollow();
  if (tags.loading) {
    return null;
  }
  return (
    <Tooltip title={t('tagButton.tooltip')}>
      <IconButton
        size="small"
        className={`${styles.marginLeft} qetaFollowTagBtn`}
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
