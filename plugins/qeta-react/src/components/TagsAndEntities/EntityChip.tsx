import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { CSSProperties } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { Link } from 'react-router-dom';
import { Chip } from '@material-ui/core';
import { EntityTooltip } from '../Tooltips';

export const EntityChip = (props: {
  entity: Entity | string;
  style?: CSSProperties;
  useHref?: boolean;
}) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entity);
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const href = entityRoute({ entityRef });

  return (
    <EntityTooltip entity={entity} arrow enterDelay={400} interactive>
      <Chip
        label={primaryTitle}
        size="small"
        style={props.style}
        icon={Icon ? <Icon fontSize="small" /> : undefined}
        variant="outlined"
        className="qetaEntityChip"
        component={props.useHref ? 'a' : Link}
        to={props.useHref ? undefined : href}
        href={props.useHref ? href : undefined}
        target={props.useHref ? '_blank' : undefined}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
        clickable
      />
    </EntityTooltip>
  );
};
