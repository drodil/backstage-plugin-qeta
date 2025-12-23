import { UsersResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { UsersGridItem } from './UsersGridItem';
import { NoUsersCard } from './NoUsersCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';
import { useInfiniteScroll } from 'infinite-scroll-hook';

export const UsersGridContent = (props: {
  loading: boolean;
  error: any;
  response?: UsersResponse;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const { response, error, loading, hasMore, loadNextPage } = props;
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

  if (loading && (!response || response.users.length === 0)) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('usersPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.users || response.users.length === 0) {
    return (
      <Grid xs={12}>
        <NoUsersCard />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} alignItems="stretch">
      {response.users.map(entity => (
        <UsersGridItem user={entity} key={entity.userRef} />
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
