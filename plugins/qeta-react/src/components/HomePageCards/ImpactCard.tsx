import numeral from 'numeral';
import { useQetaApi } from '../../hooks';
import { Box, Card, CardContent, Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const ImpactCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUserImpact(), []);

  if (loading || error || !response) {
    return null;
  }

  return (
    <Box display={{ md: 'none', lg: 'block' }} style={{ marginBottom: '1em' }}>
      <Card>
        <CardContent>
          <Typography variant="h5">{t('impactCard.title')}</Typography>
          <Typography variant="h5">
            {response.impact >= 1000
              ? numeral(response.impact).format('0.0 a')
              : response.impact}
            <Typography variant="caption" style={{ marginLeft: '1em' }}>
              {t('impactCard.views')}
            </Typography>
          </Typography>
          <Typography variant="body2">
            {t('impactCard.contributions', {
              lastWeek: response.lastWeekImpact.toString(10),
            })}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
