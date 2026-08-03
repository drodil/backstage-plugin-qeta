import { PostsQuery, PostType } from '@drodil/backstage-plugin-qeta-common';
import { PostListItem } from '../PostsContainer';
import { useQetaApi, useQetaConfig } from '../../hooks';
import { Card, CardBody, CardHeader } from '@backstage/ui';
import styles from './PostsCard.module.css';

export const PostsCard = (props: {
  title: string;
  options?: PostsQuery;
  postType?: PostType;
}) => {
  const { isPostTypeDisabled } = useQetaConfig();

  const { value: response } = useQetaApi(
    api =>
      api.getPosts({
        limit: 3,
        type: props.postType,
        includeAttachments: false,
        includeExperts: false,
        includeAnswers: false,
        includeComments: false,
        includeVotes: false,
        includeTrend: false,
        ...props.options,
      }),
    [],
  );

  if (props.postType && isPostTypeDisabled(props.postType)) {
    return null;
  }

  const posts = response?.posts ?? [];
  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className={styles.header}>{props.title}</CardHeader>
      <CardBody className={styles.body}>
        {posts.map((question, index) => (
          <div key={question.id}>
            <PostListItem post={question} type={props.postType} />
            {index < posts.length - 1 && <div className={styles.divider} />}
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
