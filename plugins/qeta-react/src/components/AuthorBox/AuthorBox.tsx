import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { UserLink } from '../Links';
import { useUserInfo } from '../../hooks/useEntityAuthor';
import { Avatar, Flex, Text } from '@backstage/ui';
import { ExpertIcon } from '../Icons/ExpertIcon.tsx';
import styles from './AuthorBox.module.css';

export const AuthorBox = (props: {
  userEntityRef: string;
  time: string | Date;
  label: string;
  expert?: boolean;
  anonymous?: boolean;
  compact?: boolean;
  noLink?: boolean;
}) => {
  const { userEntityRef, time, label, expert, anonymous, compact, noLink } =
    props;
  const { name, user } = useUserInfo(userEntityRef);

  if (compact) {
    return (
      <Flex
        align="end"
        gap="1"
        className={`qetaAuthorBox ${styles.authorBoxCompact}`}
      >
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          size="x-small"
          className="qetaAuthorBoxAvatar"
        />
        <Text variant="body-small" as="span">
          <UserLink
            entityRef={userEntityRef}
            anonymous={anonymous}
            noLink={noLink}
          />
        </Text>
        {expert && <ExpertIcon className={styles.expertIcon} />}
        <Text className="qetaAuthorBoxCreated" variant="body-small" as="span">
          <RelativeTimeWithTooltip value={time} />
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      gap="1"
      className={`qetaAuthorBox ${styles.authorBox}`}
    >
      <Flex justify="end" className={styles.timeRow}>
        <Text className="qetaAuthorBoxCreated" variant="body-x-small">
          {label} <RelativeTimeWithTooltip value={time} />
        </Text>
      </Flex>
      <Flex align="center" justify="end" gap="1" className={styles.authorInfo}>
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          size="x-small"
          className="qetaAuthorBoxAvatar"
        />
        <div className={styles.authorLink}>
          <UserLink
            entityRef={userEntityRef}
            anonymous={anonymous}
            noLink={noLink}
          />
          {expert && <ExpertIcon className={styles.expertIcon} />}
        </div>
      </Flex>
    </Flex>
  );
};
