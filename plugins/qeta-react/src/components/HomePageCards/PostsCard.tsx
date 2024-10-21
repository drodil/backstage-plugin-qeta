import { Card, CardHeader, Divider, Grid } from '@material-ui/core';
import React from 'react';
import { useQetaApi } from '../../utils/hooks';
import {
  GetPostsOptions,
  PostType,
} from '@drodil/backstage-plugin-qeta-common';
import { PostListItem } from '../PostsContainer';

export const PostsCard = (props: {
  type: string;
  title: string;
  options?: GetPostsOptions;
  icon?: React.ReactNode;
  postType?: PostType;
}) => {
  const { value: response } = useQetaApi(
    api => api.getPosts({ limit: 3, type: props.postType, ...props.options }),
    [],
  );

  const posts = response?.posts ?? [];
  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader style={{ paddingBottom: '8px' }} title={props.title} />
      <Grid container spacing={2}>
        {posts.map(question => {
          return (
            <Grid item xs={12} key={question.id}>
              <PostListItem post={question} type={props.postType} />
              <Divider />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};
