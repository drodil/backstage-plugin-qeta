import { makeStyles } from '@material-ui/core';

export const useListItemStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
    '&:first-child': {
      paddingTop: theme.spacing(2),
    },
  },
}));
