import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { Chip, Tooltip } from '@material-ui/core';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';

export const EntityChip = (props: { entity: Entity | string }) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, secondaryTitle } = useEntityPresentation(entity);
  const compound =
    typeof entity === 'string'
      ? parseEntityRef(entity)
      : getCompoundEntityRef(entity);
  return (
    <Tooltip title={secondaryTitle ?? primaryTitle} arrow>
      <Chip
        label={primaryTitle}
        size="small"
        variant="outlined"
        className="qetaEntityChip"
        component="a"
        href={entityRoute(compound)}
        clickable
      />
    </Tooltip>
  );
};
