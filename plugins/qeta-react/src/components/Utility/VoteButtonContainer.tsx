import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(
  () => ({
    root: {
      textAlign: 'center',
      width: '32px',
      marginLeft: '5px',
      display: 'inline-block',
      verticalAlign: 'top',
    },
  }),
  { name: 'QetaVoteButtonContainer' },
);

export const VoteButtonContainer = (props: { children: React.ReactNode }) => {
  const styles = useStyles();
  return <div className={styles.root}>{props.children}</div>;
};
