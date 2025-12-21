import { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(
  () => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
    },
  }),
  { name: 'ContentHeaderButtons' },
);

export const ButtonContainer = (props: { children: ReactNode }) => {
  const styles = useStyles();
  return <div className={styles.root}>{props.children}</div>;
};
