import {
  CollectionResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { EntityChip } from './EntityChip';
import { TagChip } from './TagChip';

export const TagsAndEntities = (props: {
  entity: PostResponse | CollectionResponse;
}) => {
  const { entity } = props;

  const tags = 'postTags' in entity ? entity.postTags : entity.tags;
  const entities =
    'postEntities' in entity ? entity.postEntities : entity.entities;

  if ((!tags || tags.length === 0) && (!entities || entities.length === 0)) {
    return null;
  }

  return (
    <>
      {tags && tags.map(tag => <TagChip key={tag} tag={tag} />)}
      {entities &&
        entities.map(component => (
          <EntityChip entity={component} key={component} />
        ))}
    </>
  );
};
