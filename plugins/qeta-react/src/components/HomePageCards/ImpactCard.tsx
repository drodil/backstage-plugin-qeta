import numeral from 'numeral';
import { useQetaApi } from '../../hooks';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Alert } from '@material-ui/lab';

interface ImpactResponse {
  impact: number;
  lastWeekImpact: number;
}

export const ImpactCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    value: response,
    loading,
    error,
  } = useQetaApi<ImpactResponse>(api => api.getUserImpact(), []);

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{t('impactCard.error')}</Alert>;
    }

    if (!response) {
      return null;
    }

    const formattedImpact =
      response.impact >= 1000
        ? numeral(response.impact).format('0.0 a')
        : response.impact;

    return (
      <>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('impactCard.title')}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography
            variant="h5"
            component="p"
            aria-label={`${formattedImpact} views`}
          >
            {formattedImpact}
            <Typography
              variant="caption"
              component="span"
              style={{ marginLeft: '1em' }}
              color="textSecondary"
            >
              {t('impactCard.views')}
            </Typography>
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {t('impactCard.contributions', {
            lastWeek: response.lastWeekImpact.toString(10),
          })}
        </Typography>
      </>
    );
  };

  return (
    <Box
      display={{ md: 'none', lg: 'block' }}
      style={{ marginBottom: '1em' }}
      role="region"
      aria-label={t('impactCard.title')}
    >
      <Card elevation={2}>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Box>
  );
};
