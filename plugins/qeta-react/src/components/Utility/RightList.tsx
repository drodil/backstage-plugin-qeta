import React from 'react';
import { Box, List, ListSubheader, makeStyles, Paper } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    marginBottom: '1em',
  },
}));

export const RightListContainer = (props: { children: React.ReactNode }) => {
  const styles = useStyles();
  return (
    <Box display={{ md: 'none', lg: 'block' }}>
      <Paper className={styles.container}>{props.children}</Paper>
    </Box>
  );
};

export const RightList = (props: {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}) => {
  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          disableSticky
          component="div"
          id="nested-list-subheader"
          color="primary"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
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
