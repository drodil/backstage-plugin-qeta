import { useUserFollow } from '../../hooks';
import { useUserInfo } from '../../hooks/useEntityAuthor';
import { RightList, RightListContainer } from '../Utility/RightList';
import { Avatar, List, ListRow } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';
import { userRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { UserTooltip } from '../Tooltips';
import styles from './FollowedUsersList.module.css';

const FollowedUserItem = ({ entityRef }: { entityRef: string }) => {
  const userRoute = useRouteRef(userRouteRef);
  const { name, user } = useUserInfo(entityRef);
  const href = `${userRoute()}/${entityRef}`;

  return (
    <UserTooltip
      entityRef={entityRef}
      interactive={false}
      enterDelay={400}
      enterNextDelay={400}
      placement="left"
    >
      <Link to={href} className={styles.link}>
        <List>
          <ListRow
            icon={
              <Avatar
                src={user?.spec?.profile?.picture ?? ''}
                name={name ?? entityRef}
                size="small"
              />
            }
          >
            {name ?? entityRef}
          </ListRow>
        </List>
      </Link>
    </UserTooltip>
  );
};

export const FollowedUsersList = () => {
  const users = useUserFollow();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (users.users.length === 0 || users.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedUsers')} limit={5} randomize>
        {users.users.map(user => (
          <FollowedUserItem key={user} entityRef={user} />
        ))}
      </RightList>
    </RightListContainer>
  );
};
