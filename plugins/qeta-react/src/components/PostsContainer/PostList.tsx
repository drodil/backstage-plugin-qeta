import { Progress, WarningPanel } from '@backstage/core-components';
import {
  Box,
  Card,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { PostListItem } from './PostListItem';
import { Pagination } from '@material-ui/lab';
import { PostsResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { NoPostsCard } from './NoPostsCard';
import { useStyles, useTranslation } from '../../hooks';

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
  const styles = useStyles();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
    }
    onPageChange(value);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    if (listRef.current) {
      listRef.current.scrollIntoView();
    }
    onPageSizeChange(Number.parseInt(event.target.value as string, 10));
  };

  if (loading && initialLoad) {
    return <Progress />;
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

  if (initialLoad && (!response.posts || response.posts.length === 0)) {
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
            {response.posts.map(post => {
              return (
                <Grid item xs={12} key={post.id}>
                  <PostListItem post={post} entity={entity} type={type} />
                  <Divider />
                </Grid>
              );
            })}
          </Grid>
        </Card>
        <Grid
          container
          spacing={0}
          className={`qetaPostListPaginationGrid ${styles.questionListPagination}`}
          alignItems="center"
          justifyContent="space-between"
        >
          <Tooltip title={t('postsList.postsPerPage', { itemType })} arrow>
            <FormControl variant="filled">
              <Select
                value={props.pageSize}
                onChange={handlePageSizeChange}
                className={`qetaPostListPaginationSizeSelect ${styles.questionsPerPage}`}
                inputProps={{ className: styles.questionsPerPageInput }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>
          <Pagination
            page={page}
            onChange={handlePageChange}
            count={pageCount}
            size="large"
            variant="outlined"
            className="qetaPostListPagination"
            showFirstButton
            showLastButton
          />
        </Grid>
      </Box>
    </div>
  );
};
