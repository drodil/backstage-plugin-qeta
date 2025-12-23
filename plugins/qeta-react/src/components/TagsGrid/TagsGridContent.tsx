import { TagGridItem } from './TagGridItem';
import { TagsResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { NoTagsCard } from './NoTagsCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';
import { useInfiniteScroll } from 'infinite-scroll-hook';

export const TagsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: TagsResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const {
    response,
    onTagEdit,
    loading,
    error,
    isModerator,
    hasMore,
    loadNextPage,
  } = props;
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

  if (loading && (!response || response.tags.length === 0)) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.tags || response.tags.length === 0) {
    return (
      <Grid item xs={12}>
        <NoTagsCard />
      </Grid>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Grid container spacing={3} alignItems="stretch">
        {response?.tags.map(tag => (
          <TagGridItem
            tag={tag}
            key={tag.tag}
            onTagEdit={onTagEdit}
            isModerator={isModerator}
          />
        ))}
      </Grid>
      <div
        ref={sentryRef}
        style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
      >
        {loading && <LoadingGrid />}
      </div>
    </div>
  );
};
