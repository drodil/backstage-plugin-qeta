import * as React from 'react';
import {
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Theme,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';

export type QetaSearchBarClassKeys =
  | 'root'
  | 'input'
  | 'iconButton'
  | 'divider';

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      minWidth: 300,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 5,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  }),
  { name: 'QetaSearchBar' },
);

export const SearchBar = (props: {
  label: string;
  onSearch: (query: string) => void;
}) => {
  const { label, onSearch } = props;
  const [searchQuery, setSearchQuery] = React.useState('');
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.root}>
      <IconButton
        type="button"
        aria-label="search"
        className={classes.iconButton}
      >
        <SearchIcon color="disabled" />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder={label}
        value={searchQuery}
        inputProps={{
          'aria-label': label,
          onChange: (
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => {
            onSearch(event.target.value);
            setSearchQuery(event.target.value);
          },
        }}
      />
      {searchQuery && (
        <IconButton
          type="button"
          aria-label="clear"
          className={classes.iconButton}
          onClick={() => {
            onSearch('');
            setSearchQuery('');
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Paper>
  );
};
