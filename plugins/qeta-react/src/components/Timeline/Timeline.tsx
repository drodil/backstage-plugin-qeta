import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { TimelineItem } from '@drodil/backstage-plugin-qeta-common';
import { TimelineItemCard } from './TimelineItem';
import { Progress, ErrorPanel } from '@backstage/core-components';
import { Box, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';

import { useInfiniteScroll } from 'infinite-scroll-hook';

export interface TimelineProps {
  loadMore?: boolean;
  limit?: number;
}

export const Timeline = (props: TimelineProps) => {
  const { loadMore = true, limit = 25 } = props;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchTimeline = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentOffset = reset ? 0 : offset;
        const response = await qetaApi.getTimeline({
          limit,
          offset: currentOffset,
        });

        if (reset) {
          setItems(response.items);
        } else {
          setItems(prev => [...prev, ...response.items]);
        }

        setHasMore(loadMore && response.items.length === limit);
        setOffset(currentOffset + limit);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [qetaApi, offset, limit, loadMore],
  );

  useEffect(() => {
    fetchTimeline(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: !hasMore || !!error || loading,
    onLoadMore: async () => {
      await fetchTimeline(false);
    },
    offset: '800px',
  });

  if (loading && items.length === 0) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('timeline.title')}
      </Typography>
      {items.map((item, index) => (
        <TimelineItemCard
          key={`${item.type}-${item.id}-${index}`}
          item={item}
        />
      ))}
      {(loading || hasMore) && (
        <div
          ref={sentryRef}
          style={{ height: '20px', margin: '10px 0', textAlign: 'center' }}
        >
          {loading && (
            <Typography variant="body2">{t('timeline.loading')}</Typography>
          )}
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p style={{ textAlign: 'center' }}>
          <b>{t('timeline.noMoreItems')}</b>
        </p>
      )}
    </Box>
  );
};
