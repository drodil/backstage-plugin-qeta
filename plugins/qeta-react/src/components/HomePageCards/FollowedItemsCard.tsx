import { Fragment } from 'react';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Flex,
  List,
  ListRow,
  Skeleton,
  Text,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import {
  tagRouteRef,
  userRouteRef,
  collectionRouteRef,
  entityRouteRef,
} from '../../routes';
import {
  useTagsFollow,
  useEntityFollow,
  useUserFollow,
  useCollectionsFollow,
  useQetaConfig,
} from '../../hooks';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Link } from 'react-router-dom';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import {
  EntityTooltip,
  UserTooltip,
  TagTooltip,
  CollectionTooltip,
} from '../Tooltips';
import {
  RiPriceTag3Line,
  RiPlayListLine,
  RiShapesLine,
  RiNotification3Line,
} from '@remixicon/react';
import styles from './FollowedItemsCard.module.css';

const EntityItem = ({ entityRef }: { entityRef: string }) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);

  return (
    <EntityTooltip
      entity={entityRef}
      interactive={false}
      enterDelay={400}
      enterNextDelay={400}
      placement="left"
    >
      <Link to={entityRoute({ entityRef })} className={styles.link}>
        <List>
          <ListRow
            icon={Icon ? <Icon fontSize="small" /> : <RiShapesLine size={16} />}
          >
            {primaryTitle ?? entityRef}
          </ListRow>
        </List>
      </Link>
    </EntityTooltip>
  );
};

export const FollowedItemsCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  const { tags, loading: tagsLoading } = useTagsFollow();
  const { entities, loading: entitiesLoading } = useEntityFollow();
  const { users, userEntities, loading: usersLoading } = useUserFollow();
  const { collections, loading: collectionsLoading } = useCollectionsFollow();

  const tagRoute = useRouteRef(tagRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const collectionRoute = useRouteRef(collectionRouteRef);

  const isLoading =
    tagsLoading || entitiesLoading || usersLoading || collectionsLoading;

  const hasAnyItems =
    (!disabled.tags && tags.length > 0) ||
    (!disabled.entities && entities.length > 0) ||
    users.length > 0 ||
    (!disabled.collections && collections.length > 0);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(row => (
            <Fragment key={row}>
              <Skeleton
                width="40%"
                height={16}
                className={styles.loadingTitle}
              />
              {[1, 2].map(i => (
                <Flex
                  key={i}
                  align="center"
                  gap="2"
                  className={styles.loadingRow}
                >
                  <Skeleton rounded width={20} height={20} />
                  <Skeleton width="60%" height={16} />
                </Flex>
              ))}
            </Fragment>
          ))}
        </div>
      );
    }

    if (!hasAnyItems) {
      return (
        <Text color="secondary" className={styles.emptyMessage}>
          {t('homePage.noFollowedItems')}
        </Text>
      );
    }

    return (
      <>
        {!disabled.tags && tags.length > 0 && (
          <>
            <Text
              variant="body-x-small"
              color="secondary"
              className={styles.sectionTitle}
            >
              {t('homePage.tags')}
            </Text>
            {tags.slice(0, 5).map(tag => (
              <TagTooltip
                key={tag}
                tag={tag}
                interactive={false}
                enterDelay={400}
                enterNextDelay={400}
                placement="left"
              >
                <Link to={tagRoute({ tag })} className={styles.link}>
                  <List>
                    <ListRow icon={<RiPriceTag3Line size={16} />}>
                      {tag}
                    </ListRow>
                  </List>
                </Link>
              </TagTooltip>
            ))}
          </>
        )}

        {!disabled.entities && entities.length > 0 && (
          <>
            <Text
              variant="body-x-small"
              color="secondary"
              className={styles.sectionTitle}
            >
              {t('homePage.entities')}
            </Text>
            {entities.slice(0, 5).map(entity => (
              <EntityItem key={entity} entityRef={entity} />
            ))}
          </>
        )}

        {users.length > 0 && (
          <>
            <Text
              variant="body-x-small"
              color="secondary"
              className={styles.sectionTitle}
            >
              {t('homePage.users')}
            </Text>
            {users.slice(0, 5).map(user => {
              const entity = userEntities.get(user);
              const displayName = entity?.spec?.profile?.displayName ?? user;
              return (
                <UserTooltip
                  key={user}
                  entityRef={user}
                  interactive={false}
                  enterDelay={400}
                  enterNextDelay={400}
                  placement="left"
                >
                  <Link to={`${userRoute()}/${user}`} className={styles.link}>
                    <List>
                      <ListRow
                        icon={
                          <Avatar
                            src={entity?.spec?.profile?.picture ?? ''}
                            name={displayName}
                            size="small"
                          />
                        }
                      >
                        {displayName}
                      </ListRow>
                    </List>
                  </Link>
                </UserTooltip>
              );
            })}
          </>
        )}

        {!disabled.collections && collections.length > 0 && (
          <>
            <Text
              variant="body-x-small"
              color="secondary"
              className={styles.sectionTitle}
            >
              {t('homePage.collections')}
            </Text>
            {collections.slice(0, 5).map(collection => (
              <CollectionTooltip
                key={collection.id}
                collectionId={collection.id}
                interactive={false}
                enterDelay={400}
                enterNextDelay={400}
                placement="left"
              >
                <Link
                  to={collectionRoute({ id: collection.id.toString() })}
                  className={styles.link}
                >
                  <List>
                    <ListRow icon={<RiPlayListLine size={16} />}>
                      {collection.title}
                    </ListRow>
                  </List>
                </Link>
              </CollectionTooltip>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex align="center" gap="2">
          <RiNotification3Line size={20} />
          <Text variant="title-small">{t('homePage.followedItems')}</Text>
        </Flex>
      </CardHeader>
      <CardBody className={styles.content}>{renderContent()}</CardBody>
    </Card>
  );
};
