import { Post, selectByPostType } from '@drodil/backstage-plugin-qeta-common';
import { Link } from '@backstage/core-components';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { AuthorLink } from '../Links';
import { Chip, TableCell, TableRow } from '@material-ui/core';
import { capitalize } from 'lodash';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import LinkIcon from '@material-ui/icons/Link';

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
            icon={selectByPostType(
              post.type,
              <HelpOutlined />,
              <CollectionsBookmarkIcon />,
              <LinkIcon />,
            )}
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
