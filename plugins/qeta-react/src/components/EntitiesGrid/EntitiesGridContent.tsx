import { EntitiesResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { EntitiesGridItem } from './EntitiesGridItem';
import { NoEntitiesCard } from './NoEntitiesCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';
import { useInfiniteScroll } from 'infinite-scroll-hook';

export const EntitiesGridContent = (props: {
  loading: boolean;
  error: any;
  response?: EntitiesResponse;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const { response, loading, error, hasMore, loadNextPage } = props;
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

  if (loading && (!response || response.entities.length === 0)) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('entitiesPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.entities || response.entities.length === 0) {
    return (
      <Grid item xs={12}>
        <NoEntitiesCard />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} alignItems="stretch">
      {response?.entities.map(entity => (
        <EntitiesGridItem entity={entity} key={entity.entityRef} />
      ))}
      <div
        ref={sentryRef}
        style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
      >
        {loading && <LoadingGrid />}
      </div>
    </Grid>
  );
};
