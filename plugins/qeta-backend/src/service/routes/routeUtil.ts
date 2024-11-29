import { Config } from '@backstage/config';
import { Request } from 'express';
import { TagsResponse } from '../../database/QetaStore';

export const getTags = (
  request: Request,
  config: Config,
  existingTags: TagsResponse,
) => {
  const maxTags = config.getOptionalNumber('qeta.tags.max') ?? 5;
  const allowedTags =
    config.getOptionalStringArray('qeta.tags.allowedTags') ?? [];
  const allowTagCreation =
    config.getOptionalBoolean('qeta.tags.allowCreation') ?? true;

  const rawTags = request.body.tags;
  let tags: string[] = Array.isArray(rawTags) ? rawTags : rawTags.split(',');

  if (tags.length === 0) {
    return [];
  }

  if (!allowTagCreation) {
    tags = tags.filter(
      tag =>
        allowedTags.includes(tag) || existingTags.tags.some(t => t.tag === tag),
    );
  }

  return tags.slice(0, maxTags);
};

export const getEntities = (request: Request, config: Config) => {
  const maxEntities = config.getOptionalNumber('qeta.entities.max') ?? 3;
  let entities = request.body.entities;
  if (Array.isArray(entities)) {
    entities = entities.slice(0, maxEntities);
  }
  return entities;
};
