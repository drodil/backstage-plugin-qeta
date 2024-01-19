import React, { useEffect } from 'react';
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
  TextField,
} from '@material-ui/core';
import { useQetaApi, useStyles } from '../../utils/hooks';
import { Autocomplete } from '@material-ui/lab';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { getEntityTitle } from '../../utils/utils';

const radioSelect = (value: string, label: string) => {
  return (
    <FormControlLabel
      value={value}
      control={<Radio size="small" />}
      label={label}
    />
  );
};

export const filterKeys = [
  'orderBy',
  'order',
  'noAnswers',
  'noCorrectAnswer',
  'noVotes',
  'entity',
] as const;
export type FilterKey = (typeof filterKeys)[number];

export interface FilterPanelProps {
  onChange: (key: FilterKey, value: string) => void;
  filters: Record<FilterKey, string>;
}

export const FilterPanel = (props: FilterPanelProps) => {
  const { onChange, filters } = props;
  const styles = useStyles();
  const { value: refs } = useQetaApi(api => api.getEntities(), []);
  const catalogApi = useApi(catalogApiRef);
  const [availableEntities, setAvailableEntities] = React.useState<
    Entity[] | null
  >(null);
  const [selectedEntity, setSelectedEntity] = React.useState<
    Entity | undefined
  >(undefined);

  useEffect(() => {
    if (refs && refs?.length > 0) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: refs.map(e => e.entityRef),
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
        .then(resp => {
          const filtered = resp.items.filter(i => i !== undefined) as Entity[];
          setAvailableEntities(filtered);
        });
    }
  }, [catalogApi, refs]);

  useEffect(() => {
    if (filters.entity && availableEntities) {
      const value = availableEntities.find(
        e => stringifyEntityRef(e) === filters.entity,
      );
      setSelectedEntity(value);
    }
  }, [availableEntities, filters]);

  const handleChange = (event: {
    target: { value: string; type?: string; name: string; checked?: boolean };
  }) => {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked ? 'true' : 'false';
    }
    onChange(event.target.name as FilterKey, value);
  };

  return (
    <Box className={`qetaFilterPanel ${styles.filterPanel}`}>
      <Grid container spacing={4}>
        <Grid item md={3} xs={4}>
          <FormGroup>
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
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  name="noVotes"
                  checked={filters.noVotes === 'true'}
                  onChange={handleChange}
                />
              }
              label="No votes"
            />
          </FormGroup>
        </Grid>
        <Grid item md={2} xs={4}>
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
        <Grid item md={2} xs={4}>
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
        {availableEntities && availableEntities.length > 0 && (
          <Grid item md={4} xs={8}>
            <FormLabel id="qeta-filter-entity">Filters</FormLabel>
            <Autocomplete
              multiple={false}
              className="qetaAskFormEntities"
              value={selectedEntity}
              id="entities-select"
              options={availableEntities}
              getOptionLabel={getEntityTitle}
              getOptionSelected={(o, v) =>
                stringifyEntityRef(o) === stringifyEntityRef(v)
              }
              onChange={(_e, newValue) => {
                handleChange({
                  target: {
                    name: 'entity',
                    value: newValue ? stringifyEntityRef(newValue) : '',
                  },
                });
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  margin="normal"
                  label="Entity"
                  placeholder="Type or select entity"
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
