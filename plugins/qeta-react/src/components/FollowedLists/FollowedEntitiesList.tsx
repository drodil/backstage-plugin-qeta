import { EntityChip } from '../TagsAndEntities/EntityChip';
import { useEntityFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import { ListItem } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const FollowedEntitiesList = () => {
  const entities = useEntityFollow();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (entities.entities.length === 0 || entities.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedEntities')}>
        <ListItem style={{ display: 'block' }} dense>
          {entities.entities.map(entity => (
            <EntityChip key={entity} entity={entity} />
          ))}
        </ListItem>
      </RightList>
    </RightListContainer>
  );
};
