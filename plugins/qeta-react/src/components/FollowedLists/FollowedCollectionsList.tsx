import { Box, Divider, List, ListItem, ListSubheader } from '@material-ui/core';
import React from 'react';
import { useStyles, useTranslation } from '../../hooks';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { CollectionChip } from '../TagsAndEntities/CollectionChip';

export const FollowedCollectionsList = () => {
  const classes = useStyles();
  const collections = useCollectionsFollow();
  const { t } = useTranslation();

  if (collections.collections.length === 0 || collections.loading) {
    return null;
  }

  return (
    <Box
      className={`qetaQuestionHighlightList ${classes.postHighlightListContainer}`}
      display={{ md: 'none', lg: 'block' }}
    >
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={`qetaQuestionHighlightListList ${classes.postHighlightList}`}
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
