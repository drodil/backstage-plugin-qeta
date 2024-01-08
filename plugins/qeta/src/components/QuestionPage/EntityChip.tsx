import { Entity, getCompoundEntityRef } from '@backstage/catalog-model';
import { Chip, Tooltip } from '@material-ui/core';
import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';

export const EntityChip = (props: { entity: Entity }) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, secondaryTitle } = useEntityPresentation(entity);
  return (
    <Tooltip title={secondaryTitle ?? primaryTitle} arrow>
      <Chip
        label={primaryTitle}
        size="small"
        variant="outlined"
        className="qetaEntityChip"
        component="a"
        href={entityRoute(getCompoundEntityRef(entity))}
        clickable
      />
    </Tooltip>
  );
};
