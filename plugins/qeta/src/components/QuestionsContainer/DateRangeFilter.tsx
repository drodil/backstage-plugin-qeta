import React, { useEffect, useState } from 'react';
import { Box, MenuItem, TextField, Typography } from '@material-ui/core';
import { useStyles } from '../../utils/hooks';
import { formatDate } from '../../utils/utils';

export interface DateRangeFilterProps {
  value?: string;
  onChange: (dateRange: 'dateRange', value: string | string[]) => void;
}

type DateRangeValidation = {
  isValid: boolean;
  message?: string;
};

export const DateRangeFilter = (props: DateRangeFilterProps) => {
  const { value, onChange } = props;
  const styles = useStyles();
  const [dateRangeOption, setDateRangeOption] = useState<string | undefined>(
    value,
  );
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [validation, setValidation] = useState<DateRangeValidation>({
    isValid: true,
  });

  const localDate = formatDate(new Date());

  useEffect(() => {
    setDateRangeOption(value || '');
    if (value && value.indexOf('--') >= 0) {
      setDateRangeOption('custom');
      setFromDate(value.split('--')[0] || '');
      setToDate(value.split('--')[1] || '');
    }
  }, [value]);

  useEffect(() => {
    if (dateRangeOption && dateRangeOption !== 'custom') {
      setFromDate('');
      setToDate('');
      onChange(
        'dateRange',
        !dateRangeOption || dateRangeOption === 'select' ? '' : dateRangeOption,
      );
    }
  }, [dateRangeOption, onChange]);

  useEffect(() => {
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      if (startDate <= endDate) {
        setValidation({ isValid: true });
        onChange('dateRange', `${fromDate}--${toDate}`);
      } else {
        setValidation({
          isValid: false,
          message:
            "Date range invalid, 'To Date' should be greater than 'From Date'",
        });
      }
    }
  }, [fromDate, toDate, onChange]);

  return (
    <Box display="flex" gridGap="16px" marginTop="24px">
      <TextField
        id="outlined-select-currency"
        select
        label="Date Range"
        value={dateRangeOption || 'select'}
        className={styles.dateFilter}
        onChange={_e => {
          setDateRangeOption(_e.target.value);
        }}
        variant="outlined"
        defaultValue="None"
      >
        <MenuItem value="select">Select</MenuItem>
        <MenuItem value="7-days">Last 7 Days</MenuItem>
        <MenuItem value="30-days">Last 30 Days</MenuItem>
        <MenuItem value="custom">Custom</MenuItem>
      </TextField>
      {dateRangeOption === 'custom' && (
        <Box display="flex" flexDirection="column">
          <Box display="flex" gridGap="12px">
            <TextField
              variant="outlined"
              label="From Date"
              id="From-date"
              type="date"
              value={fromDate}
              className={styles.dateFilter}
              InputLabelProps={{ shrink: true }}
              error={!validation.isValid}
              onChange={_e => setFromDate(_e.target.value)}
              inputProps={{
                max: toDate || localDate,
              }}
            />
            <TextField
              variant="outlined"
              label="To Date"
              id="to-date"
              type="date"
              value={toDate}
              className={styles.dateFilter}
              InputLabelProps={{ shrink: true }}
              error={!validation.isValid}
              onChange={_e => setToDate(_e.target.value)}
              inputProps={{
                min: fromDate,
                max: localDate,
              }}
            />
          </Box>
          {validation.message && (
            <Typography color="error" variant="body2">
              {validation.message}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
