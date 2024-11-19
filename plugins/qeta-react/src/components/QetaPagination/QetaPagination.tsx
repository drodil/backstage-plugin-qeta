import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useTranslation } from '../../hooks';
import Pagination from '@mui/material/Pagination';

export const QetaPagination = (props: {
  pageSize: number;
  handlePageChange: (_event: React.ChangeEvent<unknown>, value: number) => void;
  handlePageSizeChange: (event: SelectChangeEvent<number>) => void;
  page: number;
  tooltip?: string;
  pageCount: number;
}) => {
  const { handlePageChange, handlePageSizeChange, page, pageCount, tooltip } =
    props;
  const { t } = useTranslation();
  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      justifyContent="center"
      sx={{ marginTop: 4 }}
    >
      <Tooltip title={tooltip ?? t('pagination.defaultTooltip')} arrow>
        <FormControl variant="outlined">
          <Select
            value={props.pageSize}
            onChange={handlePageSizeChange}
            variant="outlined"
            size="small"
            sx={{ marginRight: 2 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>
      <Pagination
        page={page}
        onChange={handlePageChange}
        count={pageCount}
        size="large"
        variant="outlined"
        className="qetaPagination"
        showFirstButton
        showLastButton
      />
    </Grid>
  );
};
