import { Grid } from '@material-ui/core';
import { Progress } from '@backstage/core-components';

export const LoadingGrid = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: '10vh' }}
    >
      <Grid item xs={12}>
        <Progress />
      </Grid>
    </Grid>
  );
};
