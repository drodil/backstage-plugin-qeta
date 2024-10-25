import React, { useEffect, useState } from 'react';
import {
  Box,
  MenuItem,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { formatDate } from '../../utils/utils';
import { useStyles, useTranslation } from '../../hooks';

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
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [validation, setValidation] = useState<DateRangeValidation>({
    isValid: true,
  });
  const isSmallScreen = useMediaQuery<Theme>(theme =>
    theme.breakpoints.down('sm'),
  );

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
          message: t('datePicker.invalidRange'),
        });
      }
    }
  }, [t, fromDate, toDate, onChange]);

  return (
    <Box display={isSmallScreen ? 'block' : 'flex'} gridGap="16px">
      <TextField
        id="outlined-select-currency"
        select
        label={t('datePicker.range.label')}
        value={dateRangeOption || 'select'}
        className={styles.dateFilter}
        onChange={_e => {
          setDateRangeOption(_e.target.value);
        }}
        variant="outlined"
        defaultValue="None"
      >
        <MenuItem value="select">{t('datePicker.range.default')}</MenuItem>
        <MenuItem value="7-days">{t('datePicker.range.last7days')}</MenuItem>
        <MenuItem value="30-days">{t('datePicker.range.last30days')}</MenuItem>
        <MenuItem value="custom">{t('datePicker.range.custom')}</MenuItem>
      </TextField>
      {dateRangeOption === 'custom' && (
        <Box display="flex" flexDirection="column">
          <Box display={isSmallScreen ? 'block' : 'flex'} gridGap="12px">
            <TextField
              variant="outlined"
              label={t('datePicker.from')}
              id="from-date"
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
              label={t('datePicker.to')}
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
