import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { ReactNode, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { qetaApiRef } from '../../api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { useEntityFollow } from '../../hooks';
import {
  Box,
  Button,
  Flex,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiFileTextLine,
  RiGroupLine,
  RiQuestionLine,
} from '@remixicon/react';
import { qetaTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: EntityResponse; timestamp: number }> =
  new Map();
const requestCache: Map<
  string,
  Promise<EntityResponse | undefined>
> = new Map();
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

const EntityTooltipContent = ({
  entity,
  interactive,
}: {
  entity: Entity | string;
  interactive: boolean;
}) => {
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const qetaApi = useApi(qetaApiRef);
  const { primaryTitle, secondaryTitle, Icon } = useEntityPresentation(entity);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entitiesFollow = useEntityFollow();
  const styles = useTooltipStyles();
  const [resp, setResp] = useState<undefined | EntityResponse>();

  useEffect(() => {
    const cached = cache.get(entityRef);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(entityRef)) {
      requestCache.get(entityRef)?.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getEntity(entityRef).then(res => {
      if (res) {
        cache.set(entityRef, { data: res, timestamp: Date.now() });
      }
      return res || undefined;
    });

    requestCache.set(entityRef, promise);
    promise.then(res => {
      if (res) setResp(res);
      requestCache.delete(entityRef);
    });
  }, [qetaApi, entityRef]);

  if (!resp) {
    return (
      <Flex direction="column" gap="2">
        <Skeleton width={150} height={24} />
        <Skeleton width={100} height={20} />
        <Skeleton width={280} height={60} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="2">
      <div>
        <Flex align="center" gap="2">
          {Icon ? <Icon fontSize="small" /> : null}
          <Text variant="body-medium" weight="bold" truncate as="div">
            {primaryTitle}
          </Text>
        </Flex>
        <Text variant="body-small" color="secondary">
          {secondaryTitle}
        </Text>
      </div>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <RiQuestionLine size={14} />
          <Text variant="body-x-small">
            {resp.questionsCount} {t('common.questions')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiFileTextLine size={14} />
          <Text variant="body-x-small">
            {resp.articlesCount} {t('common.articles')}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiGroupLine size={14} />
          <Text variant="body-x-small">
            {t('common.followers', { count: resp.followerCount })}
          </Text>
        </div>
      </div>
      {interactive && !entitiesFollow.loading && (
        <Button
          variant="secondary"
          size="small"
          className={styles.followButton}
          iconStart={
            entitiesFollow.isFollowingEntity(entityRef) ? (
              <RiEyeOffLine size={14} />
            ) : (
              <RiEyeLine size={14} />
            )
          }
          onClick={() => {
            if (entitiesFollow.isFollowingEntity(entityRef)) {
              entitiesFollow.unfollowEntity(entityRef);
            } else {
              entitiesFollow.followEntity(entityRef);
            }
          }}
        >
          {entitiesFollow.isFollowingEntity(entityRef)
            ? t('entityButton.unfollow')
            : t('entityButton.follow')}
        </Button>
      )}
    </Flex>
  );
};

export const EntityTooltip = (props: {
  entity: Entity | string;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  [key: string]: unknown;
}) => {
  const {
    entity,
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
          <EntityTooltipContent entity={entity} interactive={interactive} />
        </Box>
      </Tooltip>
    </TooltipTrigger>
  );
};
