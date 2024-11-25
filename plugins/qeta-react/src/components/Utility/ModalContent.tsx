import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  content: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.action.selected}`,
    borderRadius: theme.shape.borderRadius,
    padding: '2em',
    '& button': {
      marginTop: '2em',
      float: 'right',
    },
  },
}));

export const ModalContent = (props: { children: React.ReactNode }) => {
  const styles = useStyles();
  return <div className={styles.content}>{props.children}</div>;
};
