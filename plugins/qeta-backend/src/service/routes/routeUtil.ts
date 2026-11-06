import { Config } from '@backstage/config';
import { Request } from 'express';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { CacheService, LoggerService } from '@backstage/backend-plugin-api';
import {
  qetaCreateTagPermission,
  TagsResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RouteOptions } from '../types';

export type EntityRefResolution =
  | { ok: true; entityRef: string }
  | { ok: false; error: string };

export type EntityRefsResolution =
  | { ok: true; entityRefs: string[] }
  | { ok: false; error: string };

export const resolveEntityRef = async (
  request: Request,
  options: RouteOptions,
  entityRef: string,
): Promise<EntityRefResolution> => {
  let canonicalRef: string | undefined;
  try {
    canonicalRef = stringifyEntityRef(
      parseEntityRef(entityRef),
    ).toLocaleLowerCase('en-US');
  } catch {
    // Incomplete refs are resolved by exact catalog name below.
  }

  const { token } = await options.auth.getPluginRequestToken({
    onBehalfOf: await options.httpAuth.credentials(request),
    targetPluginId: 'catalog',
  });

  if (canonicalRef) {
    const entity = await options.catalog.getEntityByRef(canonicalRef, {
      token,
    });
    if (!entity) {
      return {
        ok: false,
        error: `Catalog entity "${canonicalRef}" was not found or is not accessible to the current user.`,
      };
    }
    return { ok: true, entityRef: canonicalRef };
  }

  const name = entityRef.trim();
  if (!name || name.includes(':') || name.includes('/')) {
    return {
      ok: false,
      error: `Invalid entity ref "${entityRef}". Use a complete ref (kind:namespace/name) or a catalog entity name.`,
    };
  }

  const result = await options.catalog.queryEntities(
    {
      query: { 'metadata.name': name },
      fields: ['kind', 'metadata.name', 'metadata.namespace'],
      limit: 2,
    },
    { token },
  );
  const matches = result.items.filter(
    entity =>
      entity.metadata.name.toLocaleLowerCase('en-US') ===
      name.toLocaleLowerCase('en-US'),
  );

  if (matches.length === 0) {
    return {
      ok: false,
      error: `No catalog entity named "${name}" was found. Use an existing entity name or a complete entity ref (kind:namespace/name).`,
    };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      error: `Multiple catalog entities named "${name}" were found. Use a complete entity ref (kind:namespace/name).`,
    };
  }

  return {
    ok: true,
    entityRef: stringifyEntityRef(matches[0]).toLocaleLowerCase('en-US'),
  };
};

export const resolveEntityRefs = async (
  request: Request,
  options: RouteOptions,
  entityRefs: readonly string[] | undefined,
): Promise<EntityRefsResolution> => {
  const resolved: string[] = [];
  for (const entityRef of entityRefs ?? []) {
    const result = await resolveEntityRef(request, options, entityRef);
    if (!result.ok) {
      return result;
    }
    resolved.push(result.entityRef);
  }
  return { ok: true, entityRefs: resolved };
};

export const getTags = async (
  request: Request,
  options: RouteOptions,
  existingTags: TagsResponse,
) => {
  if (options.config.getOptionalBoolean('qeta.tags.disabled') ?? false) {
    return [];
  }

  if (!request.body.tags) {
    return [];
  }

  const maxTags = options.config.getOptionalNumber('qeta.tags.max') ?? 5;
  const allowedTags =
    options.config.getOptionalStringArray('qeta.tags.allowedTags') ?? [];
  const allowTagCreationResults = await options.permissionMgr.authorizeBoolean(
    request,
    [{ permission: qetaCreateTagPermission }],
  );
  const allowTagCreation = allowTagCreationResults[0] ?? false;

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

export const getEntities = (request: Request, config: Config): string[] => {
  if (config.getOptionalBoolean('qeta.entities.disabled') ?? false) {
    return [];
  }

  if (!request.body.entities) {
    return [];
  }
  const maxEntities = config.getOptionalNumber('qeta.entities.max') ?? 3;
  let entities = request.body.entities;
  if (Array.isArray(entities)) {
    entities = entities.slice(0, maxEntities);
  }
  return entities;
};

export const getCachedData = async <T>(
  cache: CacheService | undefined,
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>,
  logger?: LoggerService,
): Promise<T> => {
  if (!cache) {
    return fetchFn();
  }

  const cached = await cache.get(key);
  let data: T | undefined;
  if (cached) {
    try {
      data = JSON.parse(cached as string);
    } catch (_e) {
      // NOOP
    }
  }

  const refresh = async () => {
    try {
      const fresh = await fetchFn();
      await cache.set(key, JSON.stringify(fresh), { ttl });
      return fresh;
    } catch (error) {
      logger?.warn(`Failed to refresh cache for ${key}: ${error}`);
      return undefined;
    }
  };

  if (data) {
    refresh();
    return data;
  }

  const fresh = await refresh();
  if (!fresh) {
    throw new Error('Failed to fetch data');
  }
  return fresh;
};
