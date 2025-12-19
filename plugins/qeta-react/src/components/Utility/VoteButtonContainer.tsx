import { makeStyles } from '@material-ui/core';
import { ReactNode } from 'react';

const useStyles = makeStyles(
  theme => ({
    root: {
      textAlign: 'center',
      width: 'auto',
      minWidth: '40px',
      marginLeft: '0',
      marginRight: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      verticalAlign: 'top',
      padding: theme.spacing(0.5),
    },
  }),
  { name: 'QetaVoteButtonContainer' },
);

export const VoteButtonContainer = (props: { children: ReactNode }) => {
  const styles = useStyles();
  return <div className={styles.root}>{props.children}</div>;
};
