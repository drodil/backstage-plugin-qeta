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
  'tags',
] as const;
export type FilterKey = (typeof filterKeys)[number];

export type Filters = {
  order: string;
  orderBy: string;
  noAnswers: string;
  noCorrectAnswer: string;
  noVotes: string;
  searchQuery: string;
  entity: string;
  tags: string[];
};

export interface FilterPanelProps {
  onChange: (key: FilterKey, value: string | string[]) => void;
  filters: Filters;
  showEntityFilter?: boolean;
  showTagFilter?: boolean;
}

export const FilterPanel = (props: FilterPanelProps) => {
  const {
    onChange,
    filters,
    showEntityFilter = true,
    showTagFilter = true,
  } = props;
  const styles = useStyles();
  const { value: refs } = useQetaApi(api => api.getEntities(), []);
  const { value: tags } = useQetaApi(api => api.getTags(), []);
  const catalogApi = useApi(catalogApiRef);
  const [availableEntities, setAvailableEntities] = React.useState<
    Entity[] | null
  >(null);
  const [selectedEntity, setSelectedEntity] = React.useState<
    Entity | undefined
  >(undefined);
  const [availableTags, setAvailableTags] = React.useState<string[] | null>(
    null,
  );

  useEffect(() => {
    if ((tags && tags.length > 0) || filters.tags) {
      const ts = (tags ?? []).map(t => t.tag);
      if (filters.tags) {
        ts.push(...filters.tags);
      }
      setAvailableTags([...new Set(ts)]);
    }
  }, [tags, filters.tags]);

  useEffect(() => {
    const entityRefs: string[] = [];
    if (filters.entity && !Array.isArray(filters.entity)) {
      entityRefs.push(filters.entity);
    }
    if (refs && refs?.length > 0) {
      refs?.forEach(ref => {
        // ignore currently selected entity if exist in refs
        if (ref.entityRef !== filters.entity) {
          entityRefs.push(ref.entityRef);
        }
      });
    }
    if (entityRefs.length > 0) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs,
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
  }, [filters.entity, catalogApi, refs]);

  useEffect(() => {
    if (filters.entity && availableEntities) {
      const value = availableEntities.find(
        e => stringifyEntityRef(e) === filters.entity,
      );
      setSelectedEntity(value);
      if (!value) {
        onChange('entity', '');
      }
    } else {
      setSelectedEntity(undefined);
    }
  }, [availableEntities, filters.entity, onChange]);

  const handleChange = (event: {
    target: {
      value: string | string[];
      type?: string;
      name: string;
      checked?: boolean;
    };
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
        {((availableEntities && availableEntities.length > 0) ||
          (availableTags && availableTags.length > 0)) &&
          (showEntityFilter || showTagFilter) && (
            <Grid item md={4} xs={8}>
              <FormLabel id="qeta-filter-entity">Filters</FormLabel>
              {showEntityFilter &&
                availableEntities &&
                availableEntities.length > 0 && (
                  <Autocomplete
                    multiple={false}
                    className="qetaEntityFilter"
                    value={selectedEntity ?? null}
                    id="entities-select"
                    options={availableEntities}
                    getOptionLabel={getEntityTitle}
                    getOptionSelected={(o, v) => {
                      if (!o || !v) {
                        return false;
                      }
                      return stringifyEntityRef(o) === stringifyEntityRef(v);
                    }}
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
                )}
              {showTagFilter && availableTags && availableTags.length > 0 && (
                <Autocomplete
                  multiple
                  className="qetaTagFilter"
                  value={filters.tags}
                  id="tags-select"
                  options={availableTags}
                  onChange={(_e, newValue) => {
                    handleChange({
                      target: {
                        name: 'tags',
                        value: newValue,
                      },
                    });
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      margin="normal"
                      label="Tag"
                      placeholder="Type or select tag"
                    />
                  )}
                />
              )}
            </Grid>
          )}
      </Grid>
    </Box>
  );
};
