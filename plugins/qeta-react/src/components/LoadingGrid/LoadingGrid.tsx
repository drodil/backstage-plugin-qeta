import Grid from '@mui/material/Grid';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export const LoadingGrid = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: '20vh' }}
    >
      <Grid item>
        <Skeleton variant="rectangular" height={200} />
      </Grid>
    </Grid>
  );
};
