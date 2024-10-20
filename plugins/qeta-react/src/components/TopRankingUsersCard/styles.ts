import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => {
  return {
    trophyIcon: {
      backgroundColor: 'initial',
      color: theme.palette.text.primary,
      borderRadius: '50%',
      boxSizing: 'border-box',
      padding: '0.5rem',
      height: 50,
      width: 50,
    },
    votesText: {
      display: 'grid',
      placeItems: 'center',
      marginLeft: '16px',
    },
  };
});
