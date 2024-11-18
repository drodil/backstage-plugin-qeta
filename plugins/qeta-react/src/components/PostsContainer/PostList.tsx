import { WarningPanel } from '@backstage/core-components';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { useRef } from 'react';
import { PostListItem } from './PostListItem';
import { PostsResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { NoPostsCard } from './NoPostsCard';
import { useTranslation } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { SelectChangeEvent } from '@mui/material/Select';

export const PostList = (props: {
  loading: boolean;
  error: any;
  response?: PostsResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  page: number;
  pageSize: number;
  pageCount: number;
  entity?: string;
  tags?: string[];
  showNoQuestionsBtn?: boolean;
  entityPage?: boolean;
  type?: PostType;
}) => {
  const {
    loading,
    error,
    response,
    onPageChange,
    entity,
    page,
    onPageSizeChange,
    showNoQuestionsBtn = true,
    entityPage,
    tags,
    type,
  } = props;
  const listRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
    }
    onPageChange(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
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

  const pageCount =
    response.total < props.pageSize
      ? 1
      : Math.ceil(response.total / props.pageSize);

  return (
    <div ref={listRef}>
      <Box sx={{ mt: 2 }} className="qetaPostList">
        <Card>
          <Grid container spacing={2} style={{ paddingTop: '1rem' }}>
            {response.posts.map((post, i) => {
              return (
                <Grid
                  item
                  xs={12}
                  key={post.id}
                  style={{ paddingBottom: '1rem' }}
                >
                  <PostListItem post={post} entity={entity} type={type} />
                  {i !== response.total - 1 && <Divider />}
                </Grid>
              );
            })}
          </Grid>
        </Card>
        {response.total > 0 && (
          <QetaPagination
            pageSize={props.pageSize}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            page={page}
            pageCount={pageCount}
            tooltip={t('postsList.postsPerPage', { itemType })}
          />
        )}
      </Box>
    </div>
  );
};
