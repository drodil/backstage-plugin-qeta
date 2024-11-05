import React from 'react';
import { useStyles, useTranslation, useUserFollow } from '../../hooks';
import { UserChip } from '../TagsAndEntities/UserChip';
import { Box, Divider, List, ListItem, ListSubheader } from '@material-ui/core';

export const FollowedUsersList = () => {
  const users = useUserFollow();
  const classes = useStyles();
  const { t } = useTranslation();

  if (users.users.length === 0 || users.loading) {
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
            {t('rightMenu.followedUsers')}
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem style={{ display: 'block' }} dense>
          {users.users.map(user => (
            <UserChip key={user} entityRef={user} />
          ))}
        </ListItem>
      </List>
    </Box>
  );
};
