import { useCallback, useEffect, useState } from 'react';
import { CalendarDate, parseDate } from '@internationalized/date';
import { formatDate } from '../../utils/utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, DateRangePicker, Select } from '@backstage/ui';
import styles from './DateRangeFilter.module.css';

export interface DateRangeFilterProps {
  value?: string;
  onChange: (value: string | string[]) => void;
}

const toDateValue = (value: string): CalendarDate | undefined => {
  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
};

export const DateRangeFilter = (props: DateRangeFilterProps) => {
  const { value, onChange } = props;
  const [dateRangeOption, setDateRangeOption] = useState<string | undefined>(
    value,
  );
  const { t } = useTranslationRef(qetaTranslationRef);
  const localDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(localDate);
  const [toDate, setToDate] = useState(localDate);

  useEffect(() => {
    setDateRangeOption(value || '');
    if (value?.includes('--')) {
      setDateRangeOption('custom');
      setFromDate(value.split('--')[0] || '');
      setToDate(value.split('--')[1] || '');
    }
  }, [value]);

  const handleCustom = useCallback(
    (from: string, to: string) => {
      setFromDate(from);
      setToDate(to);
      onChange(`${from}--${to}`);
    },
    [onChange],
  );

  const fromDateValue = toDateValue(fromDate);
  const toDateValueParsed = toDateValue(toDate);
  const maxDateValue = toDateValue(localDate);
  const customDateRangeValue =
    fromDateValue && toDateValueParsed
      ? { start: fromDateValue, end: toDateValueParsed }
      : null;

  return (
    <Box className={styles.root}>
      <Select
        className={styles.select}
        value={dateRangeOption || 'date-range'}
        onChange={key => {
          const selected = String(key);
          if (selected === 'custom') {
            handleCustom(fromDate, toDate);
          } else {
            onChange(selected === 'date-range' ? '' : selected);
          }
          setDateRangeOption(selected);
        }}
        options={[
          { id: 'date-range', label: t('datePicker.range.label') },
          { id: '7-days', label: t('datePicker.range.last7days') },
          { id: '30-days', label: t('datePicker.range.last30days') },
          { id: 'custom', label: t('datePicker.range.custom') },
        ]}
      />
      {dateRangeOption === 'custom' && (
        <DateRangePicker
          className={styles.dateRange}
          label={t('datePicker.range.custom')}
          maxValue={maxDateValue}
          value={customDateRangeValue}
          onChange={range => {
            if (range?.start && range?.end) {
              handleCustom(range.start.toString(), range.end.toString());
            }
          }}
        />
      )}
    </Box>
  );
};
