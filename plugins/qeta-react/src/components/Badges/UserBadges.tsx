import { useQetaApi } from '../../hooks';
import { BadgeChip } from './BadgeChip';
import { Alert, Box, Grid, Skeleton, Text } from '@backstage/ui';
import { UserBadge } from '@drodil/backstage-plugin-qeta-common';

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import styles from './UserBadges.module.css';

const LEVEL_ORDER: Record<string, number> = {
  diamond: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

const sortBadgesByLevel = (badges: UserBadge[]): UserBadge[] => {
  return [...badges].sort((a, b) => {
    const levelA = LEVEL_ORDER[a.badge.level] ?? 99;
    const levelB = LEVEL_ORDER[b.badge.level] ?? 99;
    return levelA - levelB;
  });
};

export const UserBadges = ({ entityRef }: { entityRef: string }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    value: badges,
    loading,
    error,
  } = useQetaApi(api => api.getUserBadges(entityRef), [entityRef]);

  if (loading) {
    return <Skeleton width="100%" height={100} />;
  }

  if (error) {
    return <Alert status="danger" icon description={t('userBadges.error')} />;
  }

  const sortedBadges = badges ? sortBadgesByLevel(badges) : [];

  const groupedBadges = sortedBadges.reduce(
    (acc, userBadge) => {
      const key = userBadge.badge.id;
      if (!acc[key]) {
        acc[key] = {
          badge: userBadge.badge,
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { badge: UserBadge['badge']; count: number }>,
  );

  const displayBadges = Object.values(groupedBadges).sort((a, b) => {
    const levelA = LEVEL_ORDER[a.badge.level] ?? 99;
    const levelB = LEVEL_ORDER[b.badge.level] ?? 99;
    return levelA - levelB;
  });

  return (
    <Box>
      <Text variant="title-small" as="div" className={styles.title}>
        {t('userBadges.title')}
      </Text>
      {displayBadges.length === 0 ? (
        <Text variant="body-medium">{t('userBadges.noBadges')}</Text>
      ) : (
        <Grid.Root columns={{ initial: '12' }} gap="6" className={styles.grid}>
          {displayBadges.map(item => (
            <Grid.Item
              key={item.badge.key}
              colSpan={{ initial: '6', sm: '4', lg: '3' }}
            >
              <BadgeChip badge={item.badge} count={item.count} />
            </Grid.Item>
          ))}
        </Grid.Root>
      )}
    </Box>
  );
};
