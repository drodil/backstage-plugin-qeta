import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListSubheader,
} from '@material-ui/core';
import React from 'react';
import { useStyles, useTagsFollow, useTranslation } from '../../utils/hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';

export const FollowedTagsList = () => {
  const classes = useStyles();
  const tags = useTagsFollow();
  const tagRoute = useRouteRef(tagRouteRef);
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
            <Chip
              key={tag}
              label={tag}
              size="small"
              className="qetaTagChip"
              component="a"
              href={tagRoute({ tag: tag })}
              clickable
            />
          ))}
        </ListItem>
      </List>
    </Box>
  );
};
