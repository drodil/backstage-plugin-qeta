import {
  Answer,
  Comment,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { Link, LinkProps } from '@backstage/core-components';

export const UserLink = (props: {
  entityRef: string;
  linkProps?: LinkProps;
}) => {
  const { entityRef, linkProps } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { primaryTitle: userName } = useEntityPresentation(entityRef);

  return (
    <Link to={`${userRoute()}/${entityRef}`} {...linkProps}>
      {userName}
    </Link>
  );
};

export const AuthorLink = (props: {
  entity: Question | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;

  if (entity.author === 'anonymous') {
    return <>Anonymous</>;
  }

  return <UserLink entityRef={entity.author} linkProps={linkProps} />;
};

export const UpdatedByLink = (props: {
  entity: Question | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;
  if (!entity.updatedBy) {
    return null;
  }
  return <UserLink entityRef={entity.updatedBy} linkProps={linkProps} />;
};
