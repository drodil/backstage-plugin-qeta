import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { Tag } from '@backstage/ui';
import { EntityTooltip } from '../Tooltips';

export const EntityChip = (props: {
  entity: Entity | string;
  style?: CSSProperties;
  useHref?: boolean;
}) => {
  const { entity, useHref } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const navigate = useNavigate();
  const { primaryTitle, Icon } = useEntityPresentation(entity);
  const entityRef =
    typeof entity === 'string' ? entity : stringifyEntityRef(entity);
  const href = entityRoute({ entityRef });

  return (
    <EntityTooltip entity={entity} enterDelay={400} interactive>
      <Tag
        size="small"
        style={props.style}
        icon={Icon ? <Icon fontSize="small" /> : undefined}
        className="qetaEntityChip"
        href={useHref ? href : undefined}
        target={useHref ? '_blank' : undefined}
        onPress={useHref ? undefined : () => navigate(href)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        {primaryTitle}
      </Tag>
    </EntityTooltip>
  );
};
