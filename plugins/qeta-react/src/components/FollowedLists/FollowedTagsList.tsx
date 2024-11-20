import ListItem from '@mui/material/ListItem';
import React from 'react';
import { TagChip } from '../TagsAndEntities/TagChip';
import { useTagsFollow, useTranslation } from '../../hooks';
import { RightList, RightListContainer } from '../Styled/RightList';

export const FollowedTagsList = () => {
  const tags = useTagsFollow();
  const { t } = useTranslation();

  if (tags.tags.length === 0 || tags.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedTags')}>
        <ListItem style={{ display: 'block' }} dense>
          {tags.tags.map(tag => (
            <TagChip key={tag} tag={tag} />
          ))}
        </ListItem>
      </RightList>
    </RightListContainer>
  );
};
