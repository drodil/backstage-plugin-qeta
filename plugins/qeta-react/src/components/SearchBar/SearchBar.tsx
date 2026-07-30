import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchField } from '@backstage/ui';
import debounce from 'lodash/debounce';
import styles from './SearchBar.module.css';

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
    minSearchLength = 1,
    debounceTime = 150,
  } = props;
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <SearchField
      aria-label={label}
      placeholder={label}
      value={searchQuery}
      onChange={handleSearch}
      onClear={handleClear}
      icon={loading ? <div className={styles.spinner} /> : undefined}
    />
  );
};
