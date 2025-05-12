import { Post } from '@drodil/backstage-plugin-qeta-common';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import { AuthorLink } from '../Links';
import { Chip, TableCell, TableRow } from '@material-ui/core';
import { capitalize } from 'lodash';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';

export const PostsTableRow = (props: { post: Post; showIcon?: boolean }) => {
  const { post } = props;
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);

  const route = post.type === 'question' ? questionRoute : articleRoute;

  return (
    <TableRow key={post.id}>
      <TableCell>
        <Link to={route({ id: post.id.toString(10) })}>{post.title}</Link>
      </TableCell>
      <TableCell>
        <AuthorLink entity={post} />
      </TableCell>
      {props.showIcon && (
        <TableCell>
          <Chip
            color="secondary"
            size="small"
            label={`${capitalize(post.type)}`}
            icon={
              post.type === 'question' ? (
                <HelpOutlined />
              ) : (
                <CollectionsBookmarkIcon />
              )
            }
          />
        </TableCell>
      )}
      <TableCell>
        <RelativeTimeWithTooltip value={post.created} />
      </TableCell>
      <TableCell>
        <RelativeTimeWithTooltip
          value={post.updated ? post.updated : post.created}
        />
      </TableCell>
    </TableRow>
  );
};
