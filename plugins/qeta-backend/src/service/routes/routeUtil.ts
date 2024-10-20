import { Config } from '@backstage/config';
import { Request } from 'express';

export const getTags = (request: Request, config: Config) => {
  const maxTags = config.getOptionalNumber('qeta.tags.max') ?? 5;
  const allowedTags =
    config.getOptionalStringArray('qeta.tags.allowedTags') ?? [];
  const allowTagCreation =
    config.getOptionalBoolean('qeta.tags.allowCreation') ?? true;

  let tags = request.body.tags;
  if (Array.isArray(tags)) {
    if (!allowTagCreation) {
      tags = tags.filter(tag => allowedTags?.includes(tag));
    }
    tags = tags.slice(0, maxTags);
  }
  return tags;
};

export const getEntities = (request: Request, config: Config) => {
  const maxEntities = config.getOptionalNumber('qeta.entities.max') ?? 3;
  let entities = request.body.entities;
  if (Array.isArray(entities)) {
    entities = entities.slice(0, maxEntities);
  }
  return entities;
};
