import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useCollectionsFollow } from '../../hooks/useCollectionsFollow';
import { RightList, RightListContainer } from '../Utility/RightList';
import { List, ListRow } from '@backstage/ui';
import { RiPlayListLine } from '@remixicon/react';
import { Link } from 'react-router-dom';
import { collectionRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { CollectionTooltip } from '../Tooltips';
import { useQetaConfig } from '../../hooks';
import styles from './FollowedCollectionsList.module.css';

export const FollowedCollectionsList = () => {
  const collections = useCollectionsFollow();
  const { t } = useTranslationRef(qetaTranslationRef);
  const collectionRoute = useRouteRef(collectionRouteRef);
  const { disabled } = useQetaConfig();

  if (
    disabled.collections ||
    collections.collections.length === 0 ||
    collections.loading
  ) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedCollections')} limit={5} randomize>
        {collections.collections.map(collection => {
          const href = collectionRoute({ id: collection.id.toString(10) });
          return (
            <CollectionTooltip
              key={collection.id}
              collectionId={collection.id}
              interactive={false}
              enterDelay={400}
              enterNextDelay={400}
              placement="left"
            >
              <Link to={href} className={styles.link}>
                <List>
                  <ListRow icon={<RiPlayListLine size={16} />}>
                    {collection.title}
                  </ListRow>
                </List>
              </Link>
            </CollectionTooltip>
          );
        })}
      </RightList>
    </RightListContainer>
  );
};
