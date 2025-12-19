import { makeStyles } from '@material-ui/core';

const useGridItemStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'currentColor',
      opacity: theme.palette.action.hoverOpacity || 0.04,
      borderRadius: theme.shape.borderRadius,
      pointerEvents: 'none',
    },
  },
  cardHeader: {
    padding: theme.spacing(2, 2, 1, 2),
    '& .MuiCardHeader-content': {
      minWidth: 0,
    },
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
    padding: theme.spacing(0, 2, 2, 2),
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
