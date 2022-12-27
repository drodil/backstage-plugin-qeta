import React from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from '@material-ui/core';

const radioSelect = (value: string, label: string) => {
  return (
    <FormControlLabel
      value={value}
      control={<Radio size="small" />}
      label={label}
    />
  );
};

export type FilterKey = 'orderBy' | 'order' | 'noAnswers' | 'noCorrectAnswer';
export interface FilterPanelProps {
  onChange: (key: FilterKey, value: string) => void;
  filters: Record<FilterKey, string>;
}

export const FilterPanel = (props: FilterPanelProps) => {
  const { onChange, filters } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked ? 'true' : 'false';
    }
    onChange(event.target.name as FilterKey, value);
  };

  return (
    <Box
      sx={{
        bgcolor: 'info.dark',
        color: 'info.contrastText',
        borderRadius: 2,
        p: 2,
        minWidth: 300,
      }}
    >
      <Grid container spacing={4}>
        <Grid item>
          <FormGroup>
            <FormLabel id="qeta-filter-order-by">Filter</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  name="noAnswers"
                  onChange={handleChange}
                  checked={filters.noAnswers === 'true'}
                />
              }
              label="No answers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  name="noCorrectAnswer"
                  checked={filters.noCorrectAnswer === 'true'}
                  onChange={handleChange}
                />
              }
              label="No correct answers"
            />
          </FormGroup>
        </Grid>
        <Grid item>
          <FormControl>
            <FormLabel id="qeta-filter-order-by">Order by</FormLabel>
            <RadioGroup
              aria-labelledby="qeta-filter-order-by"
              name="orderBy"
              value={filters.orderBy}
              onChange={handleChange}
            >
              {radioSelect('created', 'Created')}
              {radioSelect('views', 'Views')}
              {radioSelect('score', 'Score')}
              {radioSelect('answersCount', 'Answers')}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <FormLabel id="qeta-filter-order">Order</FormLabel>
            <RadioGroup
              aria-labelledby="qeta-filter-order"
              name="order"
              value={filters.order}
              onChange={handleChange}
            >
              {radioSelect('desc', 'Descending')}
              {radioSelect('asc', 'Ascending')}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};
