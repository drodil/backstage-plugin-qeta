import { useTranslation } from '../../hooks';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { CollectionChip } from '../TagsAndEntities/CollectionChip';
import { RightList, RightListContainer } from '../Utility/RightList';
import { ListItem } from '@material-ui/core';

export const FollowedCollectionsList = () => {
  const collections = useCollectionsFollow();
  const { t } = useTranslation();

  if (collections.collections.length === 0 || collections.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedCollections')}>
        <ListItem style={{ display: 'block' }} dense>
          {collections.collections.map(collection => (
            <CollectionChip key={collection.id} collection={collection} />
          ))}
        </ListItem>
      </RightList>
    </RightListContainer>
  );
};
