import Box from '@mui/material/Box';
import React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';

export const RightListContainer = (props: { children: React.ReactNode }) => {
  return (
    <Box
      display={{ md: 'none', lg: 'block' }}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        marginBottom: 2,
        borderRadius: 1,
      }}
    >
      {props.children}
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
