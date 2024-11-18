import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useTranslation } from '../../hooks';

export const NoUsersCard = () => {
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
              {t(`usersPage.users`, { count: 0 })}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
