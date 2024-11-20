import ListItem from '@mui/material/ListItem';
import React from 'react';
import { EntityChip } from '../TagsAndEntities/EntityChip';
import { useEntityFollow, useTranslation } from '../../hooks';
import { RightList, RightListContainer } from '../Styled/RightList';

export const FollowedEntitiesList = () => {
  const entities = useEntityFollow();
  const { t } = useTranslation();

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
