import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

export const LoadingGrid = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: '20vh' }}
    >
      <Grid item>
        <CircularProgress />
      </Grid>
    </Grid>
  );
};
