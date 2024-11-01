import React from 'react';
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
} from '@material-ui/core';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { DateRangeFilter } from './DateRangeFilter';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import { useStyles, useTranslation } from '../../hooks';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { TagInput } from '../PostForm/TagInput';
import { useStarredEntities } from '@backstage/plugin-catalog-react';

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
  entities?: string[];
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
  const { t } = useTranslation();
  const [entities, setEntities] = React.useState<Entity[] | undefined>(
    undefined,
  );
  const [starredEntities, setStarredEntities] = React.useState(false);
  const starredEntitiesApi = useStarredEntities();

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

  const handleStarredEntities = (checked: boolean) => {
    setStarredEntities(checked);
    setEntities([]);
    if (checked) {
      onChange('entities', [...starredEntitiesApi.starredEntities]);
    } else {
      onChange('entities', []);
    }
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
              {starredEntitiesApi.starredEntities.size > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="starredEntities"
                      onChange={e => handleStarredEntities(e.target.checked)}
                      checked={starredEntities}
                    />
                  }
                  label={t('filterPanel.starredEntities.label')}
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
        {showEntityFilter && (
          <Grid item>
            <EntitiesInput
              disabled={starredEntities}
              style={{ minWidth: '200px' }}
              onChange={(newEntities?: Entity[]) => {
                const entityRefs = (newEntities ?? []).map(e =>
                  stringifyEntityRef(e),
                );
                handleChange({
                  target: { name: 'entities', value: entityRefs },
                });
                setEntities(newEntities);
              }}
              value={entities}
              useOnlyUsedEntities
              hideHelpText
            />
          </Grid>
        )}
        {showTagFilter && (
          <Grid item>
            <TagInput
              style={{ minWidth: '200px' }}
              onChange={(newTags: string[]) => onChange('tags', newTags)}
              value={filters.tags}
              hideHelpText
              allowCreate={false}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
