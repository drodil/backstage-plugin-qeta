import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import React, { useEffect } from 'react';
import { Entity } from '@backstage/catalog-model';
import { compact } from 'lodash';
import { Chip } from '@material-ui/core';
import { tagRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { EntityChip } from './EntityChip';

export const TagsAndEntities = (props: { question: PostResponse }) => {
  const { question } = props;
  const catalogApi = useApi(catalogApiRef);
  const tagRoute = useRouteRef(tagRouteRef);
  const [entities, setEntities] = React.useState<Entity[]>([]);
  useEffect(() => {
    if (question.entities && question.entities.length > 0) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: question.entities,
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
  }, [catalogApi, question]);

  return (
    <>
      {question.tags &&
        question.tags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            className="qetaTagChip"
            component="a"
            href={tagRoute({ tag: tag })}
            clickable
          />
        ))}
      {entities &&
        entities.map((component, i) => (
          <EntityChip entity={component} key={i} />
        ))}
    </>
  );
};
