import { Grid } from '@backstage/ui';
import styles from './LoadingGrid.module.css';

export const LoadingGrid = () => {
  return (
    <Grid.Root columns={{ sm: '12' }} className={styles.root}>
      <Grid.Item colSpan={{ sm: '12' }} className={styles.item}>
        <div className={styles.spinner} />
      </Grid.Item>
    </Grid.Root>
  );
};
