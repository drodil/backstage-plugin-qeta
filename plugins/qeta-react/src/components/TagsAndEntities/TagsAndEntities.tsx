import {
  CollectionResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { EntityChip } from './EntityChip';
import { TagChip } from './TagChip';
import { Chip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';

export const TagsAndEntities = (props: {
  entity: PostResponse | CollectionResponse;
  tagsLimit?: number;
  entitiesLimit?: number;
}) => {
  const { entity, tagsLimit, entitiesLimit } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  let tags = 'postTags' in entity ? entity.postTags : entity.tags;
  let entities =
    'postEntities' in entity ? entity.postEntities : entity.entities;

  if ((!tags || tags.length === 0) && (!entities || entities.length === 0)) {
    return null;
  }

  let tagsCount = 0;
  if (tags && tagsLimit && tags.length > tagsLimit) {
    tagsCount = tags.length - tagsLimit;
    tags = tags.slice(0, tagsLimit);
  }

  let entitiesCount = 0;
  if (entities && entitiesLimit && entities.length > entitiesLimit) {
    entitiesCount = entities.length - entitiesLimit;
    entities = entities.slice(0, entitiesLimit);
  }
  const moreCount = tagsCount + entitiesCount;

  return (
    <>
      {tags && tags.map(tag => <TagChip key={tag} tag={tag} />)}
      {entities &&
        entities.map(component => (
          <EntityChip entity={component} key={component} />
        ))}
      {moreCount > 0 && (
        <Chip
          label={t('common.more', { count: moreCount } as any)}
          size="small"
          variant="outlined"
          color="primary"
        />
      )}
    </>
  );
};
