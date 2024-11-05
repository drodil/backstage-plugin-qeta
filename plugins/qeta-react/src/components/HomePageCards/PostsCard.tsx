import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import React from 'react';
import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';
import { PostListItem } from '../PostsContainer';
import { useQetaApi } from '../../hooks';

export const PostsCard = (props: {
  type: string;
  title: string;
  options?: PostsQuery;
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
