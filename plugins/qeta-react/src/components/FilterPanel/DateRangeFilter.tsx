import { useEffect, useState, useCallback } from 'react';
import { formatDate } from '../../utils/utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  Grid,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';

export interface DateRangeFilterProps {
  value?: string;
  onChange: (value: string | string[]) => void;
}

type DateRangeValidation = {
  isValid: boolean;
  message?: string;
};

const useStyles = makeStyles(
  theme => ({
    root: {},
    textInput: {
      minWidth: '230px',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      '& input[type="date"]': {
        colorScheme: theme.palette.type === 'dark' ? 'dark' : 'light',
      },
    },
  }),
  { name: 'QetaDateRangeFilter' },
);

export const DateRangeFilter = (props: DateRangeFilterProps) => {
  const { value, onChange } = props;
  const styles = useStyles();
  const [dateRangeOption, setDateRangeOption] = useState<string | undefined>(
    value,
  );
  const { t } = useTranslationRef(qetaTranslationRef);
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

  const handleCustom = useCallback(
    (from?: string, to?: string) => {
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
    },
    [onChange, fromDate, toDate, t],
  );

  return (
    <Grid container className={styles.root}>
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
          className={styles.textInput}
          value={dateRangeOption || 'date-range'}
          onChange={e => {
            if (e.target.value !== 'custom') {
              onChange(e.target.value === 'date-range' ? '' : e.target.value);
            } else {
              handleCustom();
            }
            setDateRangeOption(e.target.value);
          }}
          variant="outlined"
          defaultValue="date-range"
          fullWidth
        >
          <MenuItem value="date-range">{t('datePicker.range.label')}</MenuItem>
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
              className={styles.textInput}
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
              className={styles.textInput}
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
