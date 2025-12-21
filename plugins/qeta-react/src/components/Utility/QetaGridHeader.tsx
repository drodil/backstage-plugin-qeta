import { Box, Grid, Typography } from '@material-ui/core';
import { SearchBar } from '../SearchBar/SearchBar';

export type QetaGridHeaderProps = {
  title: React.ReactNode;
  searchBarLabel: string;
  loading: boolean;
  onSearch: (val: string) => void;
  buttons?: React.ReactNode;
};

export const QetaGridHeader = ({
  title,
  searchBarLabel,
  loading,
  onSearch,
  buttons,
}: QetaGridHeaderProps) => {
  return (
    <Box mb={3}>
      <Grid container alignItems="flex-end" justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearch}
            label={searchBarLabel}
            loading={loading}
          />
        </Grid>
      </Grid>
      <Box mt={2} mb={2}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            {!loading && (
              <Typography
                variant="h6"
                component="h2"
                style={{ fontWeight: 500, paddingBottom: 2 }}
              >
                {title}
              </Typography>
            )}
          </Grid>
          {buttons && <Grid item>{buttons}</Grid>}
        </Grid>
      </Box>
    </Box>
  );
};
