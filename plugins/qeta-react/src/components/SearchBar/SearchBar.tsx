import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const SearchBar = (props: {
  label: string;
  onSearch: (query: string) => void;
}) => {
  const { label, onSearch } = props;
  const [searchQuery, setSearchQuery] = React.useState('');
  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '1em',
        cursor: 'text',
        boxShadow: 'none',
      }}
    >
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon color="disabled" />
      </IconButton>
      <InputBase
        sx={{ flex: 1 }}
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
          sx={{ p: '10px' }}
          aria-label="clear"
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
