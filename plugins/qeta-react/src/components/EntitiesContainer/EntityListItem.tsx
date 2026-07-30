import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import {
  Box,
  List,
  ListRow,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';

import {
  RiFileTextLine,
  RiGroupLine,
  RiLinkM,
  RiQuestionLine,
} from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';

import { useQetaConfig } from '../../hooks';
import styles from './EntityListItem.module.css';

export const EntityListItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const entityRoute = useRouteRef(entityRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon, secondaryTitle } =
    useEntityPresentation(compound);

  const href = entityRoute({ entityRef: entity.entityRef });

  return (
    <Link to={href} className={styles.link}>
      <List>
        <ListRow
          icon={
            Icon ? (
              <Icon fontSize="small" />
            ) : (
              <span>{primaryTitle.charAt(0).toUpperCase()}</span>
            )
          }
          customActions={
            <Box
              className={styles.rowActions}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className={styles.statsWrapper}>
                {!disabled.questions && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiQuestionLine size={16} />
                      <Text variant="body-small">{entity.questionsCount}</Text>
                    </div>
                    <Tooltip>{t('stats.questions', {})}</Tooltip>
                  </TooltipTrigger>
                )}
                {!disabled.articles && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiFileTextLine size={16} />
                      <Text variant="body-small">{entity.articlesCount}</Text>
                    </div>
                    <Tooltip>{t('stats.articles', {})}</Tooltip>
                  </TooltipTrigger>
                )}
                {!disabled.links && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiLinkM size={16} />
                      <Text variant="body-small">{entity.linksCount}</Text>
                    </div>
                    <Tooltip>{t('stats.links', {})}</Tooltip>
                  </TooltipTrigger>
                )}
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiGroupLine size={16} />
                    <Text variant="body-small">{entity.followerCount}</Text>
                  </div>
                  <Tooltip>{t('stats.followers', {})}</Tooltip>
                </TooltipTrigger>
              </div>
              <EntityFollowButton entityRef={entity.entityRef} />
            </Box>
          }
        >
          <TooltipTrigger>
            <Text as="span" truncate className={styles.titleWrapper}>
              {primaryTitle}
            </Text>
            <Tooltip placement="top">{secondaryTitle ?? ''}</Tooltip>
          </TooltipTrigger>
        </ListRow>
      </List>
    </Link>
  );
};
