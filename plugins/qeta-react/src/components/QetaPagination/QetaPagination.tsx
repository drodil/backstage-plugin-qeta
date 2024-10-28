import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import React from 'react';
import { useStyles } from '../../hooks';
import { Pagination as MuiPagination } from '@material-ui/lab';

export const QetaPagination = (props: {
  pageSize: number;
  handlePageChange: (_event: React.ChangeEvent<unknown>, value: number) => void;
  handlePageSizeChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  page: number;
  tooltip?: string;
  pageCount: number;
}) => {
  const { handlePageChange, handlePageSizeChange, page, pageCount, tooltip } =
    props;
  const styles = useStyles();
  return (
    <Grid
      container
      spacing={0}
      className={`qetaPostListPaginationGrid ${styles.questionListPagination}`}
      alignItems="center"
      justifyContent="center"
    >
      <Tooltip title={tooltip ?? 'Change number of items'} arrow>
        <FormControl variant="filled">
          <Select
            value={props.pageSize}
            onChange={handlePageSizeChange}
            className={`qetaPaginationSizeSelect ${styles.questionsPerPage}`}
            inputProps={{ className: styles.questionsPerPageInput }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>
      <MuiPagination
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
