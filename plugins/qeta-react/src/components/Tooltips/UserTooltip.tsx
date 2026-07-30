import { useIdentityApi, useUserFollow, useUserInfo } from '../../hooks';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiCheckboxCircleLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFileTextLine,
  RiQuestionAnswerLine,
  RiQuestionLine,
  RiStarFill,
} from '@remixicon/react';
import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { ReactNode, useEffect, useState } from 'react';
import { UserStat } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: UserStat; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<UserStat | undefined>> = new Map();
const TTL = 5 * 60 * 1000;

type TooltipPlacement =
  | 'top'
  | 'top start'
  | 'top end'
  | 'bottom'
  | 'bottom start'
  | 'bottom end'
  | 'left'
  | 'left top'
  | 'left bottom'
  | 'right'
  | 'right top'
  | 'right bottom';

const UserTooltipContent = ({
  entityRef,
  anonymous,
  interactive,
}: {
  entityRef: string;
  anonymous?: boolean;
  interactive: boolean;
}) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);
  const styles = useTooltipStyles();

  const { name, user, secondaryTitle } = useUserInfo(
    entityRef,
    anonymous ?? entityRef === 'anonymous',
  );
  const [stats, setStats] = useState<UserStat | undefined>();

  useEffect(() => {
    const cached = cache.get(entityRef);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setStats(cached.data);
      return;
    }

    if (requestCache.has(entityRef)) {
      requestCache.get(entityRef)!.then(res => {
        if (res) setStats(res);
      });
      return;
    }

    const promise = qetaApi.getUserStats(entityRef).then(res => {
      if (res?.summary) {
        cache.set(entityRef, { data: res.summary, timestamp: Date.now() });
        return res.summary;
      }
      return undefined;
    });

    requestCache.set(entityRef, promise);
    promise.then(res => {
      if (res) setStats(res);
      requestCache.delete(entityRef);
    });
  }, [qetaApi, entityRef]);

  const { value: currentUser } = useIdentityApi(
    api => api.getBackstageIdentity(),
    [],
  );
  const users = useUserFollow();

  if (!stats) {
    return (
      <Flex align="center" gap="4">
        <Skeleton rounded width={40} height={40} />
        <Flex direction="column" gap="2">
          <Skeleton width={100} height={24} />
          <Skeleton width={150} height={20} />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" gap="4">
        <Avatar
          src={user?.spec?.profile?.picture ?? ''}
          name={name}
          size="x-large"
        />
        <div>
          <Text variant="body-medium" weight="bold" truncate as="div">
            {name}
          </Text>
          <Text variant="body-small" color="secondary">
            {secondaryTitle}
          </Text>
        </div>
      </Flex>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <RiQuestionLine size={14} />
          <Text variant="body-x-small">
            {stats.totalQuestions} {t('common.questions')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiQuestionAnswerLine size={14} />
          <Text variant="body-x-small">
            {stats.totalAnswers} {t('common.answers', {})}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiFileTextLine size={14} />
          <Text variant="body-x-small">
            {stats.totalArticles} {t('common.articles')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiStarFill size={14} color="var(--bui-fg-warning)" />
          <Text variant="body-x-small">
            {stats.reputation} {t('impactCard.reputation')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiEyeLine size={14} />
          <Text variant="body-x-small">
            {stats.totalViews} {t('common.views')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiCheckboxCircleLine size={14} color="var(--bui-fg-positive)" />
          <Text variant="body-x-small">
            {stats.correctAnswers} {t('impactCard.correctAnswers')}
          </Text>
        </div>
      </div>
      {interactive &&
        !users.loading &&
        currentUser?.userEntityRef !== entityRef && (
          <Button
            variant="secondary"
            size="small"
            className={styles.followButton}
            iconStart={
              users.isFollowingUser(entityRef) ? (
                <RiEyeOffLine size={14} />
              ) : (
                <RiEyeLine size={14} />
              )
            }
            onClick={() => {
              if (users.isFollowingUser(entityRef)) {
                users.unfollowUser(entityRef);
              } else {
                users.followUser(entityRef);
              }
            }}
          >
            {users.isFollowingUser(entityRef)
              ? t('userButton.unfollow')
              : t('userButton.follow')}
          </Button>
        )}
    </Flex>
  );
};

export const UserTooltip = (props: {
  entityRef: string;
  anonymous?: boolean;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  [key: string]: unknown;
}) => {
  const {
    entityRef,
    anonymous,
    interactive = true,
    children,
    className,
    placement,
    enterDelay,
  } = props;

  return (
    <TooltipTrigger delay={enterDelay}>
      {className ? <span className={className}>{children}</span> : children}
      <Tooltip placement={placement}>
        <Box p="2" maxWidth="300px">
          <UserTooltipContent
            entityRef={entityRef}
            anonymous={anonymous}
            interactive={interactive}
          />
        </Box>
      </Tooltip>
    </TooltipTrigger>
  );
};
