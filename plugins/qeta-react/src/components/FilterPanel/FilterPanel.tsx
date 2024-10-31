import React, { useEffect } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { getEntityTitle } from '../../utils/utils';
import { DateRangeFilter } from './DateRangeFilter';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi, useStyles, useTranslation } from '../../hooks';

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
  'dateRange',
] as const;
export type FilterKey = (typeof filterKeys)[number];

export type Filters = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  searchQuery?: string;
  entity?: string;
  tags?: string[];
  dateRange?: string;
};

export type PostFilters = Filters & {
  orderBy?:
    | 'rank'
    | 'created'
    | 'title'
    | 'views'
    | 'score'
    | 'trend'
    | 'answersCount'
    | 'updated';
  noAnswers?: 'true' | 'false';
  noCorrectAnswer?: 'true' | 'false';
  noVotes?: 'true' | 'false';
  collectionId?: number;
  type?: PostType;
};

export type AnswerFilters = Filters & {
  orderBy?: 'created' | 'score' | 'updated';
  noVotes?: 'true' | 'false';
};

export type CollectionFilters = Filters & {
  orderBy?: 'created' | 'title';
};

function isPostFilters(filters: Filters): filters is PostFilters {
  return (filters as PostFilters).noAnswers !== undefined;
}

function isAnswerFilters(filters: Filters): filters is AnswerFilters {
  return (
    (filters as AnswerFilters).noVotes !== undefined &&
    (filters as PostFilters).noAnswers === undefined
  );
}

function isCollectionFilters(filters: Filters): filters is CollectionFilters {
  return (filters as PostFilters).noAnswers === undefined;
}

export interface FilterPanelProps<T extends Filters> {
  onChange: (key: keyof T, value: string | string[]) => void;
  filters: T;
  showEntityFilter?: boolean;
  showTagFilter?: boolean;
  answerFilters?: boolean;
  type?: PostType;
}

export const FilterPanel = <T extends Filters>(props: FilterPanelProps<T>) => {
  const {
    onChange,
    filters,
    showEntityFilter = true,
    showTagFilter = true,
    type,
  } = props;
  const styles = useStyles();
  const { value: refs } = useQetaApi(api => api.getEntities(), []);
  const { value: tags } = useQetaApi(api => api.getTags(), []);
  const catalogApi = useApi(catalogApiRef);
  const { t } = useTranslation();
  const [availableEntities, setAvailableEntities] = React.useState<
    Entity[] | null
  >(null);
  const [selectedEntity, setSelectedEntity] = React.useState<
    Entity | undefined
  >(undefined);
  const [availableTags, setAvailableTags] = React.useState<string[] | null>(
    null,
  );
  const [tagDescriptions, setTagDescriptions] = React.useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if ((tags && tags.tags && tags.total > 0) || filters.tags) {
      const ts = (tags?.tags ?? []).map(tag => tag.tag);
      if (filters.tags) {
        ts.push(...filters.tags);
      }
      setAvailableTags([...new Set(ts)]);
      setTagDescriptions(
        tags?.tags.reduce((acc, tag) => {
          if (!tag.description) {
            return acc;
          }
          acc[tag.tag] = tag.description;
          return acc;
        }, {} as Record<string, string>) ?? {},
      );
    }
  }, [tags, filters.tags]);

  useEffect(() => {
    const entityRefs: string[] = [];
    if (filters.entity && !Array.isArray(filters.entity)) {
      entityRefs.push(filters.entity);
    }
    if (refs && refs.entities && refs.total > 0) {
      refs.entities.forEach(ref => {
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
    onChange(event.target.name as keyof T, value);
  };

  const postFilters = isPostFilters(filters);
  const answerFilters = isAnswerFilters(filters);
  const collectionFilters = isCollectionFilters(filters);

  return (
    <Box className={`qetaFilterPanel ${styles.filterPanel}`}>
      <Grid
        container
        spacing={4}
        alignItems="stretch"
        justifyContent="space-evenly"
      >
        {(postFilters || answerFilters) && (
          <Grid item>
            <FormGroup>
              <FormLabel id="qeta-filter-quick">
                {t('filterPanel.quickFilters.label')}
              </FormLabel>
              {postFilters && type !== 'article' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="noAnswers"
                      onChange={handleChange}
                      checked={filters.noAnswers === 'true'}
                    />
                  }
                  label={t('filterPanel.noAnswers.label')}
                />
              )}
              {postFilters && type !== 'article' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="noCorrectAnswer"
                      checked={filters.noCorrectAnswer === 'true'}
                      onChange={handleChange}
                    />
                  }
                  label={t('filterPanel.noCorrectAnswers.label')}
                />
              )}
              {(postFilters || answerFilters) && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="noVotes"
                      checked={filters.noVotes === 'true'}
                      onChange={handleChange}
                    />
                  }
                  label={t('filterPanel.noVotes.label')}
                />
              )}
            </FormGroup>
          </Grid>
        )}
        <Grid item>
          <FormControl>
            <FormLabel id="qeta-filter-order-by">
              {t('filterPanel.orderBy.label')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="qeta-filter-order-by"
              name="orderBy"
              value={filters.orderBy}
              onChange={handleChange}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0 1rem',
              }}
            >
              {postFilters &&
                filters.collectionId !== undefined &&
                radioSelect('rank', t('filterPanel.orderBy.rank'))}
              {radioSelect('created', t('filterPanel.orderBy.created'))}
              {(postFilters || collectionFilters) &&
                radioSelect('title', t('filterPanel.orderBy.title'))}
              {postFilters &&
                radioSelect('views', t('filterPanel.orderBy.views'))}
              {(postFilters || answerFilters) &&
                radioSelect('score', t('filterPanel.orderBy.score'))}
              {postFilters &&
                radioSelect('trend', t('filterPanel.orderBy.trend'))}
              {postFilters &&
                type !== 'article' &&
                radioSelect('answersCount', t('filterPanel.orderBy.answers'))}
              {(postFilters || answerFilters) &&
                radioSelect('updated', t('filterPanel.orderBy.updated'))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <FormLabel id="qeta-filter-order">
              {t('filterPanel.order.label')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="qeta-filter-order"
              name="order"
              value={filters.order}
              onChange={handleChange}
            >
              {radioSelect('desc', t('filterPanel.order.desc'))}
              {radioSelect('asc', t('filterPanel.order.asc'))}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Box marginY="24px">
        <Divider />
      </Box>
      <Grid container alignItems="stretch" justifyContent="space-evenly">
        <Grid item>
          <DateRangeFilter value={filters.dateRange} onChange={onChange} />
        </Grid>

        {showEntityFilter &&
          availableEntities &&
          availableEntities.length > 0 && (
            <Grid item>
              <Autocomplete
                multiple={false}
                disablePortal
                className="qetaEntityFilter"
                value={selectedEntity ?? null}
                id="entities-select"
                options={availableEntities}
                renderOption={option => {
                  return (
                    <>
                      <Tooltip title={stringifyEntityRef(option)}>
                        <span>{getEntityTitle(option)}</span>
                      </Tooltip>
                    </>
                  );
                }}
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
                    style={{ minWidth: '200px' }}
                    variant="outlined"
                    margin="normal"
                    label={t('filterPanel.filters.entity.label')}
                    placeholder={t('filterPanel.filters.entity.placeholder')}
                  />
                )}
              />
            </Grid>
          )}
        {showTagFilter && availableTags && availableTags.length > 0 && (
          <Grid item>
            <Autocomplete
              multiple
              style={{ minWidth: '200px' }}
              disablePortal
              className="qetaTagFilter"
              value={filters.tags}
              id="tags-select"
              options={availableTags}
              renderOption={option => {
                if (tagDescriptions[option]) {
                  return (
                    <>
                      <Tooltip title={tagDescriptions[option]}>
                        <span>{option}</span>
                      </Tooltip>
                    </>
                  );
                }
                return option;
              }}
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
                  label={t('filterPanel.filters.tag.label')}
                  placeholder={t('filterPanel.filters.tag.placeholder')}
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
