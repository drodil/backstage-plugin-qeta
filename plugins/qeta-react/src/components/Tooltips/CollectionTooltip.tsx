import { useState, useEffect, ReactElement, ReactNode } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import {
  Box,
  Button,
  Flex,
  Focusable,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiBookShelfLine,
  RiEyeLine,
  RiEyeOffLine,
  RiGroupLine,
} from '@remixicon/react';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<number, { data: Collection; timestamp: number }> = new Map();
const requestCache: Map<number, Promise<Collection | undefined>> = new Map();
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

const CollectionTooltipContent = ({
  collectionId,
  interactive,
}: {
  collectionId: number;
  interactive: boolean;
}) => {
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const collections = useCollectionsFollow();
  const styles = useTooltipStyles();
  const [resp, setResp] = useState<undefined | Collection>();

  useEffect(() => {
    const cached = cache.get(collectionId);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(collectionId)) {
      requestCache.get(collectionId)!.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getCollection(collectionId).then(res => {
      if (res) {
        cache.set(collectionId, { data: res, timestamp: Date.now() });
        return res;
      }
      return undefined;
    });

    requestCache.set(collectionId, promise);
    promise.then(res => {
      if (res) setResp(res);
      requestCache.delete(collectionId);
    });
  }, [qetaApi, collectionId]);

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
      <Flex align="center" gap="2">
        <RiBookShelfLine size={16} />
        <Text variant="body-medium" weight="bold">
          {resp.title}
        </Text>
      </Flex>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <RiBookShelfLine size={14} />
          <Text variant="body-x-small">
            {t('common.posts', {
              count: resp.postsCount ?? resp.posts?.length ?? 0,
              itemType: 'post',
            })}
          </Text>
        </div>
        <div className={styles.stat}>
          <RiGroupLine size={14} />
          <Text variant="body-x-small">
            {t('common.followers', { count: resp.followers })}
          </Text>
        </div>
      </div>
      {resp.description && (
        <Text variant="body-small" color="secondary">
          {truncate(removeMarkdownFormatting(resp.description), 150)}
        </Text>
      )}
      {interactive && !collections.loading && (
        <Button
          variant="secondary"
          size="small"
          className={styles.followButton}
          iconStart={
            collections.isFollowingCollection(resp) ? (
              <RiEyeOffLine size={14} />
            ) : (
              <RiEyeLine size={14} />
            )
          }
          onClick={() => {
            if (collections.isFollowingCollection(resp)) {
              collections.unfollowCollection(resp);
            } else {
              collections.followCollection(resp);
            }
          }}
        >
          {collections.isFollowingCollection(resp)
            ? t('collectionButton.unfollow')
            : t('collectionButton.follow')}
        </Button>
      )}
    </Flex>
  );
};

export const CollectionTooltip = (props: {
  collectionId: number;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  [key: string]: unknown;
}) => {
  const {
    collectionId,
    interactive = true,
    children,
    className,
    placement,
    enterDelay,
  } = props;

  return (
    <TooltipTrigger delay={enterDelay}>
      <Focusable>
        {
          (className ? (
            <span className={className}>{children}</span>
          ) : (
            children
          )) as ReactElement<any, any>
        }
      </Focusable>
      <Tooltip placement={placement}>
        <Box p="2" maxWidth="300px">
          <CollectionTooltipContent
            collectionId={collectionId}
            interactive={interactive}
          />
        </Box>
      </Tooltip>
    </TooltipTrigger>
  );
};
