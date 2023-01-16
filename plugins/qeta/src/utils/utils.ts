import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

export const getEntityUrl = (entity: Entity) => {
  return `/catalog/${entity.metadata.namespace ?? 'default'}/${entity.kind}/${
    entity.metadata.name
  }`.toLowerCase();
};

export const formatEntityName = (username: string) => {
  const plainName = username.split(/[\/:]+/).pop();
  return plainName
    ?.split(/[_.-]+/)
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
    .join(' ');
};

export const getEntityTitle = (entity: Entity): string => {
  const stringified = stringifyEntityRef(entity);
  return formatEntityName(entity.metadata.title ?? stringified) ?? stringified;
};
