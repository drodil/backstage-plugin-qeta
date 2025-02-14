import { Config } from '@backstage/config';
import { Request } from 'express';
import {
  qetaCreateTagPermission,
  TagsResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RouterOptions } from '../types';
import { authorizeBoolean } from '../util';

export const getTags = async (
  request: Request,
  options: RouterOptions,
  existingTags: TagsResponse,
) => {
  const maxTags = options.config.getOptionalNumber('qeta.tags.max') ?? 5;
  const allowedTags =
    options.config.getOptionalStringArray('qeta.tags.allowedTags') ?? [];
  const allowTagCreation = await authorizeBoolean(
    request,
    qetaCreateTagPermission,
    options,
  );

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
