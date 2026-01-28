import { useRouteRef } from '@backstage/core-plugin-api';
import { Link, LinkProps } from '@backstage/core-components';
import { userRouteRef } from '../../routes';
import { Answer, Comment, Post } from '@drodil/backstage-plugin-qeta-common';
import { useUserInfo } from '../../hooks';
import { UserTooltip } from '../Tooltips';

export const UserLink = (props: {
  entityRef: string;
  anonymous?: boolean;
  linkProps?: LinkProps;
  noLink?: boolean;
}) => {
  const { entityRef, linkProps, anonymous, noLink } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { name, isCurrentUser } = useUserInfo(
    entityRef,
    anonymous ?? entityRef === 'anonymous',
  );
  if (anonymous && !isCurrentUser) {
    return <span>{name}</span>;
  }

  if (noLink) {
    return (
      <UserTooltip
        entityRef={entityRef}
        anonymous={anonymous}
        enterDelay={400}
        interactive
      >
        <span>{name}</span>
      </UserTooltip>
    );
  }

  return (
    <UserTooltip
      entityRef={entityRef}
      anonymous={anonymous}
      enterDelay={400}
      interactive
    >
      <Link to={`${userRoute()}/${entityRef}`} {...linkProps}>
        {name}
      </Link>
    </UserTooltip>
  );
};

export const AuthorLink = (props: {
  entity: Post | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;
  return (
    <UserLink
      entityRef={entity.author}
      linkProps={linkProps}
      anonymous={'anonymous' in entity ? entity.anonymous : undefined}
    />
  );
};

export const UpdatedByLink = (props: {
  entity: Post | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;
  if (!entity.updatedBy) {
    return null;
  }
  return (
    <UserLink
      entityRef={entity.updatedBy}
      linkProps={linkProps}
      anonymous={'anonymous' in entity ? entity.anonymous : undefined}
    />
  );
};
