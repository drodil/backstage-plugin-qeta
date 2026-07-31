import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import {
  Flex,
  Focusable,
  Skeleton,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiFileTextLine,
  RiGroupLine,
  RiPriceTag3Line,
  RiQuestionLine,
} from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

const cache: Map<string, { data: TagResponse; timestamp: number }> = new Map();
const requestCache: Map<string, Promise<TagResponse | undefined>> = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

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

const TagTooltipContent = ({ tag }: { tag: string }) => {
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useTooltipStyles();
  const [resp, setResp] = useState<undefined | TagResponse>();

  useEffect(() => {
    const cached = cache.get(tag);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResp(cached.data);
      return;
    }

    if (requestCache.has(tag)) {
      requestCache.get(tag)!.then(res => {
        if (res) setResp(res);
      });
      return;
    }

    const promise = qetaApi.getTag(tag).then(res => {
      if (res) {
        cache.set(tag, { data: res, timestamp: Date.now() });
      } else {
        const notFound: TagResponse = {
          id: 0,
          tag,
          postsCount: 0,
          questionsCount: 0,
          articlesCount: 0,
          linksCount: 0,
          followerCount: 0,
          description: t('tagChip.nonExistingTag'),
        };
        cache.set(tag, { data: notFound, timestamp: Date.now() });
        return notFound;
      }
      return res;
    });

    requestCache.set(tag, promise);
    promise.then(res => {
      setResp(res);
      requestCache.delete(tag);
    });
  }, [qetaApi, tag, t]);

  if (!resp) {
    return (
      <Flex direction="column" gap="2">
        <Skeleton width={100} height={24} />
        <Skeleton width={200} height={20} />
        <Skeleton width={280} height={100} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" gap="2">
        <RiPriceTag3Line size={16} />
        <Text variant="body-medium" weight="bold" truncate as="div">
          {tag}
        </Text>
      </Flex>
      {resp.id > 0 && (
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
      )}
      {resp.description && <MarkdownRenderer content={resp.description} />}
    </Flex>
  );
};

export const TagTooltip = (props: {
  tag: string;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  [key: string]: unknown;
}) => {
  const { tag, children, className, placement, enterDelay } = props;

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
        <TagTooltipContent tag={tag} />
      </Tooltip>
    </TooltipTrigger>
  );
};
