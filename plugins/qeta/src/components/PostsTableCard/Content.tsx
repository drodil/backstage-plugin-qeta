import { PostsTable, QetaProvider } from '@drodil/backstage-plugin-qeta-react';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import type { PluggableList } from 'unified';

export const Content = (props: {
  rowsPerPage?: number;
  quickFilter?: 'latest' | 'favorites' | 'most_viewed';
  postType?: PostType;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
}) => {
  return (
    <QetaProvider
      remarkPlugins={props.remarkPlugins}
      rehypePlugins={props.rehypePlugins}
    >
      <PostsTable hideTitle {...props} />
    </QetaProvider>
  );
};
