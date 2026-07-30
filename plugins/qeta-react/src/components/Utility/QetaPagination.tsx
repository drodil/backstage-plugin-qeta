import { ChangeEvent } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Button, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import styles from './QetaPagination.module.css';

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

  const onPageSizeSelect = (value: number) => {
    const syntheticEvent = {
      target: { value },
    } as ChangeEvent<{ value: unknown }>;
    handlePageSizeChange(syntheticEvent);
  };

  const onPageSelect = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(pageCount, nextPage));
    const syntheticEvent = {} as ChangeEvent<unknown>;
    handlePageChange(syntheticEvent, bounded);
  };

  return (
    <Box className={styles.root}>
      <TooltipTrigger>
        <div className={styles.pageSizeWrapper}>
          <select
            className={styles.pageSizeSelect}
            value={props.pageSize}
            onChange={e => onPageSizeSelect(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <Tooltip>{tooltip ?? t('pagination.defaultTooltip', {})}</Tooltip>
      </TooltipTrigger>

      <div className={styles.controls}>
        <Button
          variant="secondary"
          isDisabled={page <= 1}
          onClick={() => onPageSelect(1)}
        >
          «
        </Button>
        <Button
          variant="secondary"
          isDisabled={page <= 1}
          onClick={() => onPageSelect(page - 1)}
        >
          ‹
        </Button>
        <Text variant="body-small" className={styles.pageLabel}>
          {page} / {Math.max(pageCount, 1)}
        </Text>
        <Button
          variant="secondary"
          isDisabled={page >= pageCount}
          onClick={() => onPageSelect(page + 1)}
        >
          ›
        </Button>
        <Button
          variant="secondary"
          isDisabled={page >= pageCount}
          onClick={() => onPageSelect(pageCount)}
        >
          »
        </Button>
      </div>
    </Box>
  );
};
