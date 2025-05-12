import { ChangeEvent, useState } from 'react';
import {
  CircularProgress,
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
      boxShadow: 'none',
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
  loading?: boolean;
}) => {
  const { label, onSearch, loading } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const classes = useStyles();

  return (
    <Paper
      component="form"
      className={classes.root}
      onSubmit={e => e.preventDefault()}
    >
      <IconButton
        type="button"
        aria-label="search"
        className={classes.iconButton}
      >
        {loading ? (
          <CircularProgress size="1em" />
        ) : (
          <SearchIcon color="disabled" />
        )}
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder={label}
        value={searchQuery}
        inputProps={{
          'aria-label': label,
          onChange: (
            event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
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
