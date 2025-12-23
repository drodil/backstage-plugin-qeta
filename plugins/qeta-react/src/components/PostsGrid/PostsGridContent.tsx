import { PostsResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { useRef } from 'react';
import { WarningPanel } from '@backstage/core-components';
import { NoPostsCard } from '../PostsContainer/NoPostsCard';
import { Box, Grid } from '@material-ui/core';
import { PostsGridItem } from './PostsGridItem';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { useInfiniteScroll } from 'infinite-scroll-hook';

export const PostsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: PostsResponse;
  entity?: string;
  tags?: string[];
  showNoQuestionsBtn?: boolean;
  pageSize?: number;
  entityPage?: boolean;
  type?: PostType;
  allowRanking?: boolean;
  onRankUpdate?: () => void;
  collectionId?: number;
  hasMore?: boolean;
  loadNextPage?: () => void;
}) => {
  const {
    loading,
    error,
    response,
    entity,
    showNoQuestionsBtn = true,
    entityPage,
    tags,
    type,
    hasMore,
    loadNextPage,
  } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: !hasMore || !!error || loading,
    onLoadMore: async () => {
      if (loadNextPage) {
        await loadNextPage();
      }
    },
    offset: '800px',
  }) as any;

  if (loading && (!response || response.posts.length === 0)) {
    return <LoadingGrid />;
  }

  const itemType = (type ?? 'post') as any;

  if (error || response === undefined) {
    return (
      <WarningPanel
        severity="error"
        title={t('postsList.errorLoading', { itemType })}
      >
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response.posts || response.posts.length === 0) {
    return (
      <NoPostsCard
        showNoPostsBtn={showNoQuestionsBtn}
        entity={entity}
        entityPage={entityPage}
        tags={tags}
        type={type}
      />
    );
  }

  return (
    <div ref={gridRef}>
      <Box sx={{ mt: 2 }} className="qetaPostsGrid">
        <Grid
          container
          direction="row"
          alignItems="stretch"
          justifyContent="space-between"
        >
          {response.posts.map(p => {
            return (
              <Grid item xs={12} lg={12} xl={6} key={p.id}>
                <PostsGridItem
                  post={p}
                  type={type}
                  entity={entity}
                  allowRanking={props.allowRanking}
                  onRankUpdate={props.onRankUpdate}
                  collectionId={props.collectionId}
                />
              </Grid>
            );
          })}
        </Grid>
        <div ref={sentryRef} style={{ marginTop: '10px', textAlign: 'center' }}>
          {loading && <LoadingGrid />}
        </div>
      </Box>
    </div>
  );
};
