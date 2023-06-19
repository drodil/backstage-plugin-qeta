import { QuestionResponse } from '../../api';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import React, { useEffect } from 'react';
import {
  Entity,
  getCompoundEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { compact } from 'lodash';
import { Chip, Tooltip } from '@material-ui/core';
import { getEntityTitle } from '../../utils/utils';

export const TagsAndEntities = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const catalogApi = useApi(catalogApiRef);
  const entityRoute = useRouteRef(entityRouteRef);
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
            href={`/qeta/tags/${tag}`}
            clickable
          />
        ))}
      {entities &&
        entities.map((component, i) => (
          <Tooltip
            key={i}
            title={
              component.metadata.description?.slice(0, 50) ??
              stringifyEntityRef(component)
            }
            arrow
          >
            <Chip
              label={getEntityTitle(component)}
              size="small"
              variant="outlined"
              className="qetaEntityChip"
              component="a"
              href={entityRoute(getCompoundEntityRef(component))}
              clickable
            />
          </Tooltip>
        ))}
    </>
  );
};
