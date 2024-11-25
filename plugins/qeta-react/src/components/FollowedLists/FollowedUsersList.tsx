import React from 'react';
import { useTranslation, useUserFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import { UserChip } from '../TagsAndEntities/UserChip';
import { ListItem } from '@material-ui/core';

export const FollowedUsersList = () => {
  const users = useUserFollow();
  const { t } = useTranslation();

  if (users.users.length === 0 || users.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedUsers')}>
        <ListItem style={{ display: 'block' }} dense>
          {users.users.map(user => (
            <UserChip key={user} entityRef={user} />
          ))}
        </ListItem>
      </RightList>
    </RightListContainer>
  );
};
