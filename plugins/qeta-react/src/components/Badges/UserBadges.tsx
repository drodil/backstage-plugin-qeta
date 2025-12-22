import { useQetaApi } from '../../hooks';
import { BadgeChip } from './BadgeChip';
import { Box, Typography, Grid } from '@material-ui/core';
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('userBadges.title')}
      </Typography>
      {sortedBadges.length === 0 ? (
        <Typography variant="body2">{t('userBadges.noBadges')}</Typography>
      ) : (
        <Grid container spacing={2}>
          {sortedBadges.map((userBadge: UserBadge, index: number) => (
            <Grid item key={index}>
              <BadgeChip badge={userBadge.badge} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
