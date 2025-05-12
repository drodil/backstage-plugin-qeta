import { PostsResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { ChangeEvent, useRef } from 'react';
import { WarningPanel } from '@backstage/core-components';
import { NoPostsCard } from '../PostsContainer/NoPostsCard';
import { Box, Grid } from '@material-ui/core';
import { PostsGridItem } from './PostsGridItem';
import { useTranslation } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';

export const PostsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: PostsResponse;
  entity?: string;
  tags?: string[];
  showNoQuestionsBtn?: boolean;
  onPageSizeChange: (size: number) => void;
  pageSize: number;
  entityPage?: boolean;
  type?: PostType;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  allowRanking?: boolean;
  onRankUpdate?: () => void;
  collectionId?: number;
}) => {
  const {
    loading,
    error,
    response,
    entity,
    showNoQuestionsBtn = true,
    onPageSizeChange,
    pageSize,
    entityPage,
    tags,
    type,
    onPageChange,
    page,
    pageCount,
  } = props;
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView();
    }
    onPageChange(value);
  };

  const handlePageSizeChange = (event: ChangeEvent<{ value: unknown }>) => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView();
    }
    onPageSizeChange(Number.parseInt(event.target.value as string, 10));
  };

  if (loading) {
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
          style={{ marginTop: '1rem' }}
        >
          {response.posts.map(p => {
            return (
              <Grid item xs={12} key={p.id}>
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
        <QetaPagination
          pageSize={pageSize}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          page={page}
          pageCount={pageCount}
          tooltip={t('postsList.postsPerPage', { itemType })}
        />
      </Box>
    </div>
  );
};
