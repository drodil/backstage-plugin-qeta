import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import {
  Box,
  List,
  ListRow,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import DOMPurify from 'dompurify';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { CollectionFollowButton } from '../Buttons/CollectionFollowButton';
import {
  RiFileTextLine,
  RiGroupLine,
  RiLinkM,
  RiPlayListLine,
  RiQuestionLine,
} from '@remixicon/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import styles from './CollectionListItem.module.css';

export const CollectionListItem = (props: { collection: Collection }) => {
  const { collection } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const [imageError, setImageError] = useState(false);

  const collectionRoute = useRouteRef(collectionRouteRef);
  const href = collectionRoute({ id: collection.id.toString(10) });

  const description = collection.description
    ? DOMPurify.sanitize(
        truncate(removeMarkdownFormatting(collection.description), 100),
      )
    : undefined;

  return (
    <Link to={href} className={styles.link}>
      <List>
        <ListRow
          icon={
            collection.headerImage && !imageError ? (
              <img
                src={collection.headerImage}
                alt={collection.title}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            ) : (
              <RiPlayListLine size={16} />
            )
          }
          description={description}
          customActions={
            <Box
              className={styles.rowActions}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className={styles.statsWrapper}>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiQuestionLine size={16} />
                    <Text variant="body-small">
                      {collection.questionsCount}
                    </Text>
                  </div>
                  <Tooltip>{t('common.questions')}</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiFileTextLine size={16} />
                    <Text variant="body-small">{collection.articlesCount}</Text>
                  </div>
                  <Tooltip>{t('common.articles')}</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiLinkM size={16} />
                    <Text variant="body-small">{collection.linksCount}</Text>
                  </div>
                  <Tooltip>{t('common.links')}</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiGroupLine size={16} />
                    <Text variant="body-small">{collection.followers}</Text>
                  </div>
                  <Tooltip>{t('common.followersPlain')}</Tooltip>
                </TooltipTrigger>
              </div>
              <CollectionFollowButton collection={collection} />
            </Box>
          }
        >
          {collection.title}
        </ListRow>
      </List>
    </Link>
  );
};
