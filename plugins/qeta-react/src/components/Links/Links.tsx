import { useRouteRef } from '@backstage/core-plugin-api';
import { Link, LinkProps } from '@backstage/core-components';
import { userRouteRef } from '../../routes';
import { Answer, Comment, Post } from '@drodil/backstage-plugin-qeta-common';
import { useUserInfo } from '../../hooks';
import { UserTooltip } from '../TagsAndEntities/UserChip';
import { Tooltip } from '@material-ui/core';
import { useTooltipStyles } from '../../hooks/useTooltipStyles';

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
  const classes = useTooltipStyles();

  if (anonymous && !isCurrentUser) {
    return <span>{name}</span>;
  }

  if (noLink) {
    return (
      <Tooltip
        arrow
        title={<UserTooltip entityRef={entityRef} anonymous={anonymous} />}
        enterDelay={400}
        interactive
        classes={{
          tooltip: classes.tooltip,
          arrow: classes.tooltipArrow,
        }}
      >
        <span>{name}</span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      arrow
      title={<UserTooltip entityRef={entityRef} anonymous={anonymous} />}
      enterDelay={400}
      interactive
      classes={{
        tooltip: classes.tooltip,
        arrow: classes.tooltipArrow,
      }}
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
