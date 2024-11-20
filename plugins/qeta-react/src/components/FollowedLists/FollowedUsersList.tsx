import ListItem from '@mui/material/ListItem';
import React from 'react';
import { useTranslation, useUserFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Styled/RightList';
import { UserChip } from '../TagsAndEntities/UserChip';

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
