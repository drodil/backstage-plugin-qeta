import { ReactNode } from 'react';
import { Box, List, ListSubheader, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    marginBottom: '1em',
  },
  subheader: {
    color: theme.palette.text.hint,
    padding: '0px 0px 0.5rem 0.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1rem',
  },
  list: {
    '& li': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}));

export const RightListContainer = (props: { children: ReactNode }) => {
  const styles = useStyles();
  return (
    <Box display={{ md: 'none', lg: 'block' }} className={styles.container}>
      {props.children}
    </Box>
  );
};

export const RightList = (props: {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
}) => {
  const styles = useStyles();
  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={styles.list}
      subheader={
        <ListSubheader
          disableSticky
          component="div"
          id="nested-list-subheader"
          color="primary"
          className={styles.subheader}
        >
          {props.title}
          {props.icon}
        </ListSubheader>
      }
    >
      {props.children}
    </List>
  );
};
