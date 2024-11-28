import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Link, LinkProps } from '@backstage/core-components';
import { userRouteRef } from '../../routes';
import { Answer, Comment, Post } from '@drodil/backstage-plugin-qeta-common';
import { useUserInfo } from '../../hooks';
import { UserTooltip } from '../TagsAndEntities/UserChip';
import { Tooltip } from '@material-ui/core';

export const UserLink = (props: {
  entityRef: string;
  anonymous?: boolean;
  linkProps?: LinkProps;
}) => {
  const { entityRef, linkProps, anonymous } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { name } = useUserInfo(
    entityRef,
    anonymous ?? entityRef === 'anonymous',
  );
  return (
    <Tooltip
      arrow
      title={<UserTooltip entityRef={entityRef} anonymous={anonymous} />}
      enterDelay={400}
      interactive
    >
      <Link to={`${userRoute()}/${entityRef}`} {...linkProps}>
        {name}
      </Link>
    </Tooltip>
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
