import { Answer, Comment, Post } from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { Link, LinkProps } from '@backstage/core-components';
import { useTranslation } from '../../utils/hooks';

export const UserLink = (props: {
  entityRef: string;
  linkProps?: LinkProps;
}) => {
  const { entityRef, linkProps } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslation();
  const { primaryTitle: userName } = useEntityPresentation(
    entityRef.startsWith('user:') ? entityRef : `user:${entityRef}`,
  );
  if (entityRef === 'anonymous') {
    return <>{t('userLink.anonymous')}</>;
  }
  return (
    <Link to={`${userRoute()}/${entityRef}`} {...linkProps}>
      {userName}
    </Link>
  );
};

export const AuthorLink = (props: {
  entity: Post | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;
  return <UserLink entityRef={entity.author} linkProps={linkProps} />;
};

export const UpdatedByLink = (props: {
  entity: Post | Answer | Comment;
  linkProps?: LinkProps;
}) => {
  const { entity, linkProps } = props;
  if (!entity.updatedBy) {
    return null;
  }
  return <UserLink entityRef={entity.updatedBy} linkProps={linkProps} />;
};
