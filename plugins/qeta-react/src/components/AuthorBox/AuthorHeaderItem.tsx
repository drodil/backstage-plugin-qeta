import { useUserInfo } from '../../hooks';
import { Avatar, Flex } from '@backstage/ui';
import { UserTooltip } from '../Tooltips';
import { UserLink } from '../Links';

export const AuthorHeaderItem = (props: {
  userEntityRef: string;
  anonymous?: boolean;
  noLink?: boolean;
}) => {
  const { userEntityRef, anonymous, noLink } = props;
  const { name, user } = useUserInfo(userEntityRef);
  return (
    <UserTooltip
      entityRef={userEntityRef}
      anonymous={anonymous}
      enterDelay={400}
      interactive
    >
      <Flex gap="1" align="center">
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          size="small"
          purpose="decoration"
        />
        <UserLink
          entityRef={userEntityRef}
          anonymous={anonymous}
          noLink={noLink}
        />
      </Flex>
    </UserTooltip>
  );
};
