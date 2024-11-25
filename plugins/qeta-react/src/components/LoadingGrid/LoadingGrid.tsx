import React from 'react';
import { Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

export const LoadingGrid = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: '20vh' }}
    >
      <Grid item>
        <Skeleton variant="rect" height={200} />
      </Grid>
    </Grid>
  );
};
