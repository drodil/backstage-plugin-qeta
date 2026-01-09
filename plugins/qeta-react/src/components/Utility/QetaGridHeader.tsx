import { Box, Grid, Typography } from '@material-ui/core';
import { SearchBar } from '../SearchBar/SearchBar';

export type QetaGridHeaderProps = {
  title: React.ReactNode;
  searchBarLabel: string;
  loading: boolean;
  onSearch: (val: string) => void;
  buttons?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const QetaGridHeader = ({
  title,
  searchBarLabel,
  loading,
  onSearch,
  buttons,
  rightElement,
}: QetaGridHeaderProps) => {
  return (
    <Box mb={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box width="100%" maxWidth={400}>
          <SearchBar
            onSearch={onSearch}
            label={searchBarLabel}
            loading={loading}
          />
        </Box>
        {rightElement && (
          <Box display="flex" justifyContent="flex-end">
            {rightElement}
          </Box>
        )}
      </Box>
      <Box mt={3} mb={2}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            {!loading &&
              (typeof title === 'string' ? (
                <Typography
                  variant="h6"
                  component="h2"
                  style={{ fontWeight: 500, paddingBottom: 2 }}
                >
                  {title}
                </Typography>
              ) : (
                title
              ))}
          </Grid>
          {buttons && <Grid item>{buttons}</Grid>}
        </Grid>
      </Box>
    </Box>
  );
};
