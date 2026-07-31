import { useCallback, useEffect, useState } from 'react';
import { CalendarDate, parseDate } from '@internationalized/date';
import { formatDate } from '../../utils/utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, DatePicker, Flex, Select, Text } from '@backstage/ui';
import styles from './DateRangeFilter.module.css';

export interface DateRangeFilterProps {
  value?: string;
  onChange: (value: string | string[]) => void;
}

type DateRangeValidation = {
  isValid: boolean;
  message?: string;
};

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
  const [validation, setValidation] = useState<DateRangeValidation>({
    isValid: true,
  });

  useEffect(() => {
    setDateRangeOption(value || '');
    if (value?.includes('--')) {
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
        const formattedFrom = formatDate(startDate);
        const formattedTo = formatDate(endDate);
        setValidation({ isValid: true });
        setFromDate(formattedFrom);
        setToDate(formattedTo);
        onChange(`${formattedFrom}--${formattedTo}`);
      } else {
        setValidation({
          isValid: false,
          message: t('datePicker.invalidRange'),
        });
      }
    },
    [onChange, fromDate, toDate, t],
  );
  // TODO: Change to https://ui.backstage.io/components/date-range-picker

  return (
    <Box className={styles.root}>
      {validation.message && (
        <Text as="div" variant="body-small" className={styles.error}>
          {validation.message}
        </Text>
      )}
      <Select
        className={styles.select}
        value={dateRangeOption || 'date-range'}
        onChange={key => {
          const selected = String(key);
          if (selected === 'custom') {
            handleCustom();
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
        <Flex gap="2" className={styles.dateRange}>
          <DatePicker
            label={t('datePicker.from')}
            value={toDateValue(fromDate) ?? null}
            isInvalid={!validation.isValid}
            maxValue={toDateValue(toDate || localDate)}
            onChange={date => {
              if (date) {
                handleCustom(date.toString());
              }
            }}
          />
          <DatePicker
            label={t('datePicker.to')}
            value={toDateValue(toDate) ?? null}
            isInvalid={!validation.isValid}
            minValue={toDateValue(fromDate)}
            maxValue={toDateValue(localDate)}
            onChange={date => {
              if (date) {
                handleCustom(undefined, date.toString());
              }
            }}
          />
        </Flex>
      )}
    </Box>
  );
};
