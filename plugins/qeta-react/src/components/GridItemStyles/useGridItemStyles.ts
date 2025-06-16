import { makeStyles } from '@material-ui/core';

const useGridItemStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    },
    backgroundColor: theme.palette.background.default,
  },
  cardHeader: {
    padding: theme.spacing(2),
    '& .MuiTypography-h6': {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    '& .MuiAvatar-root': {
      width: 40,
      height: 40,
    },
  },
  cardContent: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
  stats: {
    color: theme.palette.text.secondary,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    '& > span': {
      display: 'inline-flex',
      alignItems: 'center',
    },
  },
  experts: {
    marginBottom: theme.spacing(1),
    '& .MuiTypography-caption': {
      color: theme.palette.text.secondary,
    },
  },
  description: {
    color: theme.palette.text.primary,
    lineHeight: 1.5,
  },
  cardActions: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  actionButton: {
    margin: theme.spacing(0, 1),
    textTransform: 'none',
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 180,
    display: 'block',
  },
}));

export default useGridItemStyles;
