import { PostsTable, QetaProvider } from '@drodil/backstage-plugin-qeta-react';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import type { PluggableList } from 'unified';

export const Content = (props: {
  rowsPerPage?: number;
  quickFilter?: 'latest' | 'favorites' | 'most_viewed';
  postType?: PostType | 'all';
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
}) => {
  const postType = props.postType === 'all' ? undefined : props.postType;

  return (
    <QetaProvider
      remarkPlugins={props.remarkPlugins}
      rehypePlugins={props.rehypePlugins}
    >
      <PostsTable hideTitle {...props} postType={postType} />
    </QetaProvider>
  );
};
