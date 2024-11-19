import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import React from 'react';
import { useTranslation } from '../../hooks';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { CollectionChip } from '../TagsAndEntities/CollectionChip';

export const FollowedCollectionsList = () => {
  const collections = useCollectionsFollow();
  const { t } = useTranslation();

  if (collections.collections.length === 0 || collections.loading) {
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
            {t('rightMenu.followedCollections')}
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem style={{ display: 'block' }}>
          {collections.collections.map(collection => (
            <CollectionChip key={collection.id} collection={collection} />
          ))}
        </ListItem>
      </List>
    </Box>
  );
};
