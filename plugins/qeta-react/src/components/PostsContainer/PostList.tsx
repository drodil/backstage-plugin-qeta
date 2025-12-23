import { WarningPanel } from '@backstage/core-components';
import { useRef } from 'react';
import { PostListItem } from './PostListItem';
import { PostsResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { NoPostsCard } from './NoPostsCard';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Box, Card, Divider, Grid } from '@material-ui/core';
import { useInfiniteScroll } from 'infinite-scroll-hook';

export const PostList = (props: {
  loading: boolean;
  error: any;
  response?: PostsResponse;
  entity?: string;
  tags?: string[];
  showNoQuestionsBtn?: boolean;
  entityPage?: boolean;
  type?: PostType;
  showTypeLabel?: boolean;
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
    showTypeLabel,
    hasMore,
    loadNextPage,
  } = props;
  const listRef = useRef<HTMLDivElement | null>(null);
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
    <div ref={listRef}>
      <Box sx={{ mt: 2 }} className="qetaPostList">
        <Card>
          <Grid container spacing={0}>
            {response.posts.map((post, i) => {
              return (
                <Grid item xs={12} key={post.id}>
                  <PostListItem
                    post={post}
                    entity={entity}
                    type={type}
                    showTypeLabel={showTypeLabel}
                  />
                  {i !== response.total - 1 && <Divider />}
                </Grid>
              );
            })}
          </Grid>
        </Card>
        <div ref={sentryRef} style={{ marginTop: '10px', textAlign: 'center' }}>
          {loading && <LoadingGrid />}
        </div>
      </Box>
    </div>
  );
};
