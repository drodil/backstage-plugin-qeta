import { ChangeEvent } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  FormControl,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

export type QetaPaginationClassKeys = 'root' | 'pageSizeSelect' | 'pagination';

const useStyles = makeStyles(
  () => ({
    root: {
      marginTop: '2em',
    },
    pageSizeSelect: {
      marginRight: '1em',
    },
    pagination: {},
  }),
  { name: 'QetaPagination' },
);

export const QetaPagination = (props: {
  pageSize: number;
  handlePageChange: (_event: ChangeEvent<unknown>, value: number) => void;
  handlePageSizeChange: (event: ChangeEvent<{ value: unknown }>) => void;
  page: number;
  tooltip?: string;
  pageCount: number;
}) => {
  const { handlePageChange, handlePageSizeChange, page, pageCount, tooltip } =
    props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const styles = useStyles();
  return (
    <Grid
      container
      className={styles.root}
      spacing={0}
      alignItems="center"
      justifyContent="center"
    >
      <Tooltip title={tooltip ?? t('pagination.defaultTooltip')} arrow>
        <FormControl variant="outlined">
          <Select
            value={props.pageSize}
            onChange={handlePageSizeChange}
            variant="outlined"
            className={styles.pageSizeSelect}
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
        className={styles.pagination}
        showFirstButton
        showLastButton
      />
    </Grid>
  );
};
