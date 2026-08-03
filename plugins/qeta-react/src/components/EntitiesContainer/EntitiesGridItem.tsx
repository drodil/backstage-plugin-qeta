import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import {
  Box,
  Card,
  Columns,
  Flex,
  Grid,
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
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { ClickableLink } from '../Utility/ClickableLink';
import { useQetaConfig } from '../../hooks';
import styles from './EntitiesGridItem.module.css';

export const EntitiesGridItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const classes = useGridItemStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon, secondaryTitle } =
    useEntityPresentation(compound);

  const href = entityRoute({ entityRef: entity.entityRef });

  const enabledStatsCount = [
    !disabled.questions,
    !disabled.articles,
    !disabled.links,
    true,
  ].filter(Boolean).length;
  const statColSpan = String(Math.floor(12 / enabledStatsCount)) as Columns;

  return (
    <Card className={classes.card}>
      <ClickableLink href={href} ariaLabel={primaryTitle}>
        <Flex align="center" className={classes.cardHeader}>
          {Icon && (
            <div className={styles.avatar}>
              <Icon />
            </div>
          )}
          <Box grow minWidth="0">
            <TooltipTrigger>
              <Text variant="title-x-small" weight="bold" truncate as="div">
                {primaryTitle}
              </Text>
              <Tooltip>{secondaryTitle ?? ''}</Tooltip>
            </TooltipTrigger>
          </Box>
          <Box
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <EntityFollowButton entityRef={entity.entityRef} />
          </Box>
        </Flex>
        <div className={`${classes.cardContent} ${styles.flexColumn}`}>
          <Grid.Root
            columns={{ sm: '12' }}
            gap="2"
            className={styles.statsGrid}
          >
            {!disabled.questions && (
              <Grid.Item colSpan={{ sm: statColSpan }}>
                <div className={styles.statItem}>
                  <RiQuestionLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {entity.questionsCount}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('stats.questions', {})}
                  </Text>
                </div>
              </Grid.Item>
            )}
            {!disabled.articles && (
              <Grid.Item colSpan={{ sm: statColSpan }}>
                <div className={styles.statItem}>
                  <RiFileTextLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {entity.articlesCount}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('stats.articles', {})}
                  </Text>
                </div>
              </Grid.Item>
            )}
            {!disabled.links && (
              <Grid.Item colSpan={{ sm: statColSpan }}>
                <div className={styles.statItem}>
                  <RiLinkM size={16} />
                  <Text variant="body-small" weight="bold">
                    {entity.linksCount}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('stats.links', {})}
                  </Text>
                </div>
              </Grid.Item>
            )}
            <Grid.Item colSpan={{ sm: statColSpan }}>
              <div className={styles.statItem}>
                <RiGroupLine size={16} />
                <Text variant="body-small" weight="bold">
                  {entity.followerCount}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('stats.followers', {})}
                </Text>
              </div>
            </Grid.Item>
          </Grid.Root>
        </div>
      </ClickableLink>
    </Card>
  );
};
