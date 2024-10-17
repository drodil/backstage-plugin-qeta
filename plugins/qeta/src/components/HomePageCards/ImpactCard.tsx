import { useQetaApi, useTranslation } from '../../utils/hooks';
import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import numeral from 'numeral';

export const ImpactCard = () => {
  const { t } = useTranslation();
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUserImpact(), []);

  if (loading || error || !response) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{t('impactCard.title')}</Typography>
        <Typography variant="h5">
          {response.impact >= 1000
            ? numeral(response.impact).format('0.0 a')
            : response.impact}
          <Typography variant="caption" style={{ marginLeft: '1rem' }}>
            {t('impactCard.views')}
          </Typography>
        </Typography>
        <Typography variant="body2">{t('impactCard.contributions')}</Typography>
      </CardContent>
    </Card>
  );
};