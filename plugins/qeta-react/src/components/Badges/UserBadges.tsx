import { useQetaApi } from '../../hooks';
import { BadgeChip } from './BadgeChip';
import { Box, Grid, Typography } from '@material-ui/core';
import { Alert, Skeleton } from '@material-ui/lab';
import { UserBadge } from '@drodil/backstage-plugin-qeta-common';

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';

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
    return <Skeleton variant="rect" height={100} />;
  }

  if (error) {
    return <Alert severity="error">{t('userBadges.error')}</Alert>;
  }

  const sortedBadges = badges ? sortBadgesByLevel(badges) : [];

  const groupedBadges = sortedBadges.reduce((acc, userBadge) => {
    const key = userBadge.badge.id;
    if (!acc[key]) {
      acc[key] = {
        badge: userBadge.badge,
        count: 0,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { badge: UserBadge['badge']; count: number }>);

  const displayBadges = Object.values(groupedBadges).sort((a, b) => {
    const levelA = LEVEL_ORDER[a.badge.level] ?? 99;
    const levelB = LEVEL_ORDER[b.badge.level] ?? 99;
    return levelA - levelB;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('userBadges.title')}
      </Typography>
      {displayBadges.length === 0 ? (
        <Typography variant="body2">{t('userBadges.noBadges')}</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          style={{ padding: '1em' }}
          justifyContent="flex-start"
          alignItems="stretch"
        >
          {displayBadges.map(item => (
            <Grid item key={item.badge.key} xs={6} sm={4} md={4} lg={3}>
              <BadgeChip badge={item.badge} count={item.count} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
