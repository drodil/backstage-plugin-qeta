import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import React from 'react';
import { TagChip } from '../TagsAndEntities/TagChip';
import { useTagsFollow, useTranslation } from '../../hooks';

export const FollowedTagsList = () => {
  const tags = useTagsFollow();
  const { t } = useTranslation();

  if (tags.tags.length === 0 || tags.loading) {
    return null;
  }

  return (
    <Box display={{ md: 'none', lg: 'block' }}>
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader
            disableSticky
            component="p"
            id="nested-list-subheader"
            color="primary"
          >
            {t('rightMenu.followedTags')}
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem style={{ display: 'block' }}>
          {tags.tags.map(tag => (
            <TagChip key={tag} tag={tag} />
          ))}
        </ListItem>
      </List>
    </Box>
  );
};
