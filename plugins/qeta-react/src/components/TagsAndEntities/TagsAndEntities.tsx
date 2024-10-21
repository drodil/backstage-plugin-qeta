import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import React, { useEffect } from 'react';
import { Entity } from '@backstage/catalog-model';
import { compact } from 'lodash';
import { Chip } from '@material-ui/core';
import { tagRouteRef } from '../../routes';
import { EntityChip } from '../EntityChip/EntityChip';

export const TagsAndEntities = (props: { post: PostResponse }) => {
  const { post } = props;
  const catalogApi = useApi(catalogApiRef);
  const tagRoute = useRouteRef(tagRouteRef);
  const [entities, setEntities] = React.useState<Entity[]>([]);
  useEffect(() => {
    if (post.entities && post.entities.length > 0) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: post.entities,
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
  }, [catalogApi, post]);

  return (
    <>
      {post.tags &&
        post.tags.map(tag => (
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
