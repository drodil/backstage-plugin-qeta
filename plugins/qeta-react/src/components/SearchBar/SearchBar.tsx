import { ChangeEvent, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CircularProgress,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Theme,
  Tooltip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import debounce from 'lodash/debounce';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';

export type QetaSearchBarClassKeys =
  | 'root'
  | 'input'
  | 'iconButton'
  | 'divider'
  | 'searchIcon'
  | 'loadingIcon';

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      minWidth: 300,
      boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
      },
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      fontSize: '0.9rem',
    },
    iconButton: {
      padding: 5,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    divider: {
      height: 28,
      margin: 4,
    },
    searchIcon: {
      color: theme.palette.text.secondary,
    },
    loadingIcon: {
      color: theme.palette.primary.main,
    },
  }),
  { name: 'QetaSearchBar' },
);

export const SearchBar = (props: {
  label: string;
  onSearch: (query: string) => void;
  loading?: boolean;
  minSearchLength?: number;
  debounceTime?: number;
}) => {
  const {
    label,
    onSearch,
    loading = false,
    minSearchLength = 2,
    debounceTime = 150,
  } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (query.length >= minSearchLength || query.length === 0) {
        onSearch(query);
      }
    },
    [onSearch, minSearchLength],
  );

  const debouncedSearchCallback = useMemo(
    () => debounce(debouncedSearch, debounceTime),
    [debouncedSearch, debounceTime],
  );

  useEffect(() => {
    return () => {
      debouncedSearchCallback.cancel();
    };
  }, [debouncedSearchCallback]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearchCallback(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <Paper
      component="form"
      className={classes.root}
      onSubmit={e => e.preventDefault()}
    >
      <Tooltip title={t('common.search')}>
        <IconButton
          type="button"
          aria-label="search"
          className={classes.iconButton}
        >
          {loading ? (
            <CircularProgress size={20} className={classes.loadingIcon} />
          ) : (
            <SearchIcon className={classes.searchIcon} />
          )}
        </IconButton>
      </Tooltip>
      <InputBase
        className={classes.input}
        placeholder={label}
        value={searchQuery}
        onKeyDown={handleKeyDown}
        inputProps={{
          'aria-label': label,
          onChange: (
            event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => handleSearch(event.target.value),
        }}
      />
      {searchQuery && (
        <Tooltip title={t('common.clear')}>
          <IconButton
            type="button"
            aria-label="clear"
            className={classes.iconButton}
            onClick={handleClear}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
};
