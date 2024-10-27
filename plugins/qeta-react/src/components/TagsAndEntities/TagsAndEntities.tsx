import {
  CollectionResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import React, { useEffect } from 'react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { compact } from 'lodash';
import { EntityChip } from './EntityChip';
import { TagChip } from './TagChip';

export const TagsAndEntities = (props: {
  entity: PostResponse | CollectionResponse;
}) => {
  const { entity } = props;
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = React.useState<Entity[]>([]);
  useEffect(() => {
    if (entity.entities && entity.entities.length > 0) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: entity.entities,
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
        .catch(_ => setEntities([]))
        .then(data =>
          data ? setEntities(compact(data.items)) : setEntities([]),
        );
    }
  }, [catalogApi, entity]);

  if (
    (!entity.tags || entity.tags.length === 0) &&
    (!entities || entities.length === 0)
  ) {
    return null;
  }

  return (
    <>
      {entity.tags && entity.tags.map(tag => <TagChip key={tag} tag={tag} />)}
      {entities &&
        entities.map(component => (
          <EntityChip entity={component} key={stringifyEntityRef(component)} />
        ))}
    </>
  );
};
