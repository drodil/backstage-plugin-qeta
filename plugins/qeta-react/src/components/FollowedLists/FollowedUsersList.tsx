import { useUserFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import { UserChip } from '../TagsAndEntities/UserChip';
import { ListItem } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const FollowedUsersList = () => {
  const users = useUserFollow();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (users.users.length === 0 || users.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedUsers')}>
        <ListItem style={{ display: 'block' }} dense disableGutters>
          {users.users.map(user => (
            <UserChip key={user} entityRef={user} />
          ))}
        </ListItem>
      </RightList>
    </RightListContainer>
  );
};
