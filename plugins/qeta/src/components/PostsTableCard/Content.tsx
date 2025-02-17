import React from 'react';
import { PostsTable } from '@drodil/backstage-plugin-qeta-react';
import { PostType } from '@drodil/backstage-plugin-qeta-common';

export const Content = (props: {
  rowsPerPage?: number;
  quickFilter?: 'latest' | 'favorites' | 'most_viewed';
  postType?: PostType;
}) => {
  return <PostsTable hideTitle {...props} />;
};
