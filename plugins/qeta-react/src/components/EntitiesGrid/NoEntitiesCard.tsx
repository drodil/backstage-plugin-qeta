import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from '../../hooks';

export const NoEntitiesCard = () => {
  const { t } = useTranslation();

  return (
    <Card style={{ marginTop: '2rem' }}>
      <CardContent>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Grid item>
            <Typography variant="h6">
              {t(`entitiesPage.entities`, { count: 0 })}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
