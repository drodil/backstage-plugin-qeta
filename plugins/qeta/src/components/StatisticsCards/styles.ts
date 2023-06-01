import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => {
  return {
    trophyIcon: {
      backgroundColor: 'initial',
      color: theme.palette.text.primary,
      // border: `2px solid ${theme.palette.action.disabled}`,
      borderRadius: '50%',
      boxSizing: 'border-box',
      padding: '1rem',
      height: 100,
      width: 100,
    },
    userTrophyIcon: {
      backgroundColor: 'initial',
      color: theme.palette.text.primary,
      border: `2px solid ${theme.palette.action.disabled}`,
      borderRadius: '50%',
      boxSizing: 'border-box',
      padding: '1rem',
      height: 100,
      width: 100,
    },
    userIcon: {
      backgroundColor: 'initial',
      color: theme.palette.text.primary,
      // border: `2px solid ${theme.palette.action.disabled}`,
      borderRadius: '50%',
      boxSizing: 'border-box',
      padding: '1rem',
      height: 100,
      width: 100,
    },
    votesText: {
      display: 'grid',
      placeItems: 'center',
      marginLeft: '16px',
    },
    userName: {
      textAlign: 'center',
    },
  };
});
