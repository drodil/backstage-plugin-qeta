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

  if (
    (!entity.tags || entity.tags.length === 0) &&
    (!entity.entities || entity.entities.length === 0)
  ) {
    return null;
  }

  return (
    <>
      {entity.tags && entity.tags.map(tag => <TagChip key={tag} tag={tag} />)}
      {entity.entities &&
        entity.entities.map(component => (
          <EntityChip entity={component} key={component} />
        ))}
    </>
  );
};
