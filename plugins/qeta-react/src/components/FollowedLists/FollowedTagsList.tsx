import { Box, Divider, List, ListItem, ListSubheader } from '@material-ui/core';
import React from 'react';
import { TagChip } from '../TagsAndEntities/TagChip';
import { useStyles, useTagsFollow, useTranslation } from '../../hooks';

export const FollowedTagsList = () => {
  const classes = useStyles();
  const tags = useTagsFollow();
  const { t } = useTranslation();

  if (tags.tags.length === 0 || tags.loading) {
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
