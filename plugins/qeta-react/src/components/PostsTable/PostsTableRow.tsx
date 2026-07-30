import { Post, selectByPostType } from '@drodil/backstage-plugin-qeta-common';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { AuthorLink } from '../Links';
import { Tag } from '@backstage/ui';
import { capitalize } from 'lodash';
import {
  RiFileTextLine,
  RiLinkM,
  RiQuestionAnswerLine,
} from '@remixicon/react';
import { getPostDisplayDate } from '../../utils/utils';
import styles from './PostsTableRow.module.css';

export const PostsTableRow = (props: { post: Post; showIcon?: boolean }) => {
  const { post } = props;
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  const route = selectByPostType(
    post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );

  return (
    <tr key={post.id}>
      <td>
        <Link to={route({ id: post.id.toString(10) })}>{post.title}</Link>
      </td>
      <td>
        <AuthorLink entity={post} />
      </td>
      {props.showIcon && (
        <td className={styles.typeCell}>
          <Tag
            size="small"
            icon={selectByPostType(
              post.type,
              <RiQuestionAnswerLine size={14} />,
              <RiFileTextLine size={14} />,
              <RiLinkM size={14} />,
            )}
          >
            {capitalize(post.type)}
          </Tag>
        </td>
      )}
      <td>
        <RelativeTimeWithTooltip value={getPostDisplayDate(post)} />
      </td>
      <td>
        <RelativeTimeWithTooltip
          value={post.updated ? post.updated : getPostDisplayDate(post)}
        />
      </td>
    </tr>
  );
};
