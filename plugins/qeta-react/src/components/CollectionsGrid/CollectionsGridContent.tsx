import { CollectionsResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { useInfiniteScroll } from 'infinite-scroll-hook';
import { CollectionsGridItem } from './CollectionsGridItem';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { NoCollectionsCard } from './NoCollectionsCard';

export const CollectionsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: CollectionsResponse;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const { loading, error, response, hasMore, loadNextPage } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: !hasMore || !!error || loading,
    onLoadMore: async () => {
      if (loadNextPage) {
        await loadNextPage();
      }
    },
    offset: '800px',
  }) as any;

  if (loading && (!response || response.collections.length === 0)) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel
        severity="error"
        title={t('postsList.errorLoading', { itemType: 'collections' })}
      >
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response.collections || response.collections.length === 0) {
    return <NoCollectionsCard />;
  }

  return (
    <>
      <Grid container spacing={3} direction="row" alignItems="stretch">
        {response.collections.map(p => {
          return (
            <Grid item xs={12} md={12} lg={6} key={p.id}>
              <CollectionsGridItem collection={p} />
            </Grid>
          );
        })}
      </Grid>
      <div
        ref={sentryRef}
        style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
      >
        {loading && <LoadingGrid />}
      </div>
    </>
  );
};
