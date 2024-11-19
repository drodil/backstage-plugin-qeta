import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { DateRangeFilter } from './DateRangeFilter';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../hooks';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { TagInput } from '../PostForm/TagInput';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AdjustIcon from '@mui/icons-material/Adjust';

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
  'tags',
  'dateRange',
] as const;
export type FilterKey = (typeof filterKeys)[number];

export type Filters = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  searchQuery?: string;
  entities?: string[];
  entitiesRelation?: 'and' | 'or';
  entity?: string;
  tags?: string[];
  tagsRelation?: 'and' | 'or';
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
  noCorrectAnswer?: 'true' | 'false';
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

export type Change<T extends Filters> = {
  key: keyof T;
  value: string | string[];
};

export interface FilterPanelProps<T extends Filters> {
  onChange: (changes: Change<T> | Change<T>[]) => void;
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
  const { t } = useTranslation();
  const [entities, setEntities] = React.useState<Entity[] | undefined>(
    undefined,
  );
  const [starredEntities, setStarredEntities] = React.useState(false);
  const [ownedEntities, setOwnedEntities] = React.useState(false);
  const starredEntitiesApi = useStarredEntities();
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);

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
    onChange({ key: event.target.name as keyof T, value });
  };

  const handleStarredEntities = (checked: boolean) => {
    setStarredEntities(checked);
    setEntities([]);
    if (checked) {
      onChange({
        key: 'entities',
        value: [...starredEntitiesApi.starredEntities],
      });
    } else {
      onChange({ key: 'entities', value: [] });
    }
  };

  const handleOwnedEntities = (checked: boolean) => {
    setOwnedEntities(checked);
    setEntities([]);
    if (checked) {
      identityApi.getBackstageIdentity().then(identity => {
        catalogApi
          .getEntities({
            filter: {
              'spec.owner': identity.ownershipEntityRefs,
            },
            fields: ['kind', 'metadata.name', 'metadata.namespace'],
          })
          .then(data => {
            const entityRefs = data.items.map(e => stringifyEntityRef(e));
            onChange([
              { key: 'entities', value: entityRefs },
              { key: 'entitiesRelation', value: 'or' },
            ]);
          });
      });
    } else {
      onChange([
        { key: 'entities', value: [] },
        { key: 'entitiesRelation', value: 'and' },
      ]);
    }
  };

  const postFilters = isPostFilters(filters);
  const answerFilters = isAnswerFilters(filters);
  const collectionFilters = isCollectionFilters(filters);

  return (
    <Box
      marginTop={2}
      sx={theme => ({
        border: `1px solid ${theme.palette.action.selected}`,
        borderRadius: 1,
        padding: 3,
      })}
    >
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
              {(postFilters || answerFilters) && type !== 'article' && (
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
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    name="ownedEntities"
                    onChange={e => handleOwnedEntities(e.target.checked)}
                    checked={ownedEntities}
                  />
                }
                label={t('filterPanel.ownedEntities.label')}
              />
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
          <DateRangeFilter
            value={filters.dateRange}
            onChange={val => onChange({ key: 'dateRange', value: val })}
          />
        </Grid>
        {showEntityFilter && (
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <EntitiesInput
                  disabled={starredEntities || ownedEntities}
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
              {filters.entities && filters.entities?.length > 1 && (
                <Grid item>
                  <Tooltip
                    title={
                      filters.entitiesRelation === 'or'
                        ? t('filterPanel.toggleEntityRelation.and')
                        : t('filterPanel.toggleEntityRelation.or')
                    }
                  >
                    <IconButton
                      disabled={starredEntities || ownedEntities}
                      onClick={() => {
                        if (filters.entitiesRelation === 'or') {
                          onChange({ key: 'entitiesRelation', value: 'and' });
                        } else {
                          onChange({ key: 'entitiesRelation', value: 'or' });
                        }
                      }}
                      size="large"
                    >
                      {filters.entitiesRelation === 'or' ? (
                        <AdjustIcon />
                      ) : (
                        <FiberManualRecordIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
        {showTagFilter && (
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <TagInput
                  style={{ minWidth: '200px' }}
                  onChange={(newTags: string[]) =>
                    onChange({ key: 'tags', value: newTags })
                  }
                  value={filters.tags}
                  hideHelpText
                  allowCreate={false}
                />
              </Grid>
              {filters.tags && filters.tags?.length > 1 && (
                <Grid item>
                  <Tooltip
                    title={
                      filters.tagsRelation === 'or'
                        ? t('filterPanel.toggleTagRelation.and')
                        : t('filterPanel.toggleTagRelation.or')
                    }
                  >
                    <IconButton
                      onClick={() => {
                        if (filters.tagsRelation === 'or') {
                          onChange({ key: 'tagsRelation', value: 'and' });
                        } else {
                          onChange({ key: 'tagsRelation', value: 'or' });
                        }
                      }}
                      size="large"
                    >
                      {filters.tagsRelation === 'or' ? (
                        <AdjustIcon />
                      ) : (
                        <FiberManualRecordIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
