import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import { Box, Card, Flex, Grid, Text } from '@backstage/ui';
import DOMPurify from 'dompurify';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { CollectionFollowButton } from '../Buttons/CollectionFollowButton';
import { ClickableLink } from '../Utility/ClickableLink';
import {
  RiFileTextLine,
  RiGroupLine,
  RiLinkM,
  RiPlayListLine,
  RiQuestionLine,
} from '@remixicon/react';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import styles from './CollectionsGridItem.module.css';

export interface PostsGridItemProps {
  collection: Collection;
}

export const CollectionsGridItem = (props: PostsGridItemProps) => {
  const { collection } = props;
  const classes = useGridItemStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const collectionRoute = useRouteRef(collectionRouteRef);
  const href = collectionRoute({ id: collection.id.toString(10) });

  return (
    <Card className={`${classes.card} ${styles.card}`}>
      <ClickableLink href={href} ariaLabel={collection.title}>
        {collection.headerImage ? (
          <img
            src={collection.headerImage}
            alt={collection.title}
            className={styles.image}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Box className={styles.placeholderImage}>
            <RiPlayListLine size={60} />
          </Box>
        )}
        <div className={`${classes.cardContent} ${styles.body}`}>
          <Flex align="start" justify="between" gap="2">
            <Text variant="title-x-small" weight="bold" truncate>
              {collection.title}
            </Text>
            <Box
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CollectionFollowButton collection={collection} />
            </Box>
          </Flex>
          {collection.description && (
            <Text variant="body-small" color="secondary">
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(collection.description), 200),
              )}
            </Text>
          )}
          <Box mt="4">
            <TagsAndEntities
              entity={collection}
              tagsLimit={5}
              entitiesLimit={5}
            />
          </Box>
          <Grid.Root
            columns={{ sm: '12' }}
            gap="2"
            className={styles.statsGrid}
          >
            <Grid.Item colSpan={{ sm: '3' }}>
              <div className={styles.statItem}>
                <RiQuestionLine size={16} />
                <Text variant="body-small" weight="bold">
                  {collection.questionsCount}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.questions')}
                </Text>
              </div>
            </Grid.Item>
            <Grid.Item colSpan={{ sm: '3' }}>
              <div className={styles.statItem}>
                <RiFileTextLine size={16} />
                <Text variant="body-small" weight="bold">
                  {collection.articlesCount}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.articles')}
                </Text>
              </div>
            </Grid.Item>
            <Grid.Item colSpan={{ sm: '3' }}>
              <div className={styles.statItem}>
                <RiLinkM size={16} />
                <Text variant="body-small" weight="bold">
                  {collection.linksCount}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.links')}
                </Text>
              </div>
            </Grid.Item>
            <Grid.Item colSpan={{ sm: '3' }}>
              <div className={styles.statItem}>
                <RiGroupLine size={16} />
                <Text variant="body-small" weight="bold">
                  {collection.followers}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.followersPlain')}
                </Text>
              </div>
            </Grid.Item>
          </Grid.Root>
        </div>
      </ClickableLink>
    </Card>
  );
};
