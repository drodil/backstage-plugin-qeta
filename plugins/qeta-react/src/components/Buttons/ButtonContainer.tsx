import { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(
  () => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: '0.5em',
      '& *:not(:last-child)': {
        marginRight: '0.3em',
      },
    },
  }),
  { name: 'ContentHeaderButtons' },
);

export const ButtonContainer = (props: { children: ReactNode }) => {
  const styles = useStyles();
  return <div className={styles.root}>{props.children}</div>;
};
