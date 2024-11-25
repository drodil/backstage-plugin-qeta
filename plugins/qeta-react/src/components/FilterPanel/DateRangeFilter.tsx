import React, { useEffect, useState } from 'react';
import { formatDate } from '../../utils/utils';
import { useTranslation } from '../../hooks';
import { Grid, MenuItem, TextField, Typography } from '@material-ui/core';

export interface DateRangeFilterProps {
  value?: string;
  onChange: (value: string | string[]) => void;
}

type DateRangeValidation = {
  isValid: boolean;
  message?: string;
};

export const DateRangeFilter = (props: DateRangeFilterProps) => {
  const { value, onChange } = props;
  const [dateRangeOption, setDateRangeOption] = useState<string | undefined>(
    value,
  );
  const { t } = useTranslation();
  const localDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(localDate);
  const [toDate, setToDate] = useState(localDate);
  const [validation, setValidation] = useState<DateRangeValidation>({
    isValid: true,
  });

  useEffect(() => {
    setDateRangeOption(value || '');
    if (value && value.indexOf('--') >= 0) {
      setDateRangeOption('custom');
      setFromDate(value.split('--')[0] || '');
      setToDate(value.split('--')[1] || '');
    }
  }, [value]);

  const handleCustom = (from?: string, to?: string) => {
    const startDate = new Date(from ?? fromDate);
    const endDate = new Date(to ?? toDate);
    if (startDate <= endDate) {
      setValidation({ isValid: true });
      onChange(`${formatDate(startDate)}--${formatDate(endDate)}`);
    } else {
      setValidation({
        isValid: false,
        message: t('datePicker.invalidRange'),
      });
    }
  };

  return (
    <Grid container>
      {validation.message && (
        <Grid item xs={12}>
          <Typography color="error" variant="body2">
            {validation.message}
          </Typography>
        </Grid>
      )}
      <Grid item>
        <TextField
          select
          label={t('datePicker.range.label')}
          value={dateRangeOption || 'select'}
          onChange={e => {
            if (e.target.value !== 'custom') {
              onChange(e.target.value === 'select' ? '' : e.target.value);
            }
            setDateRangeOption(e.target.value);
          }}
          variant="outlined"
          defaultValue="select"
        >
          <MenuItem value="select">{t('datePicker.range.default')}</MenuItem>
          <MenuItem value="7-days">{t('datePicker.range.last7days')}</MenuItem>
          <MenuItem value="30-days">
            {t('datePicker.range.last30days')}
          </MenuItem>
          <MenuItem value="custom">{t('datePicker.range.custom')}</MenuItem>
        </TextField>
      </Grid>
      {dateRangeOption === 'custom' && (
        <>
          <Grid item>
            <TextField
              variant="outlined"
              label={t('datePicker.from')}
              id="from-date"
              type="date"
              value={fromDate}
              InputLabelProps={{ shrink: true }}
              error={!validation.isValid}
              onChange={e => {
                handleCustom(e.target.value);
              }}
              inputProps={{
                max: toDate || localDate,
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              variant="outlined"
              label={t('datePicker.to')}
              id="to-date"
              type="date"
              value={toDate}
              InputLabelProps={{ shrink: true }}
              error={!validation.isValid}
              onChange={e => {
                handleCustom(undefined, e.target.value);
              }}
              inputProps={{
                min: fromDate,
                max: localDate,
              }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};
