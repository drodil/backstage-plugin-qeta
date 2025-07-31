import { useCallback, useEffect, useRef, useState } from 'react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { DateRangeFilter } from './DateRangeFilter';
import { PostStatus, PostType } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { EntitiesInput } from '../PostForm/EntitiesInput';
import { TagInput } from '../PostForm/TagInput';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  Tooltip,
} from '@material-ui/core';
import AdjustIcon from '@material-ui/icons/Adjust';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { compact } from 'lodash';

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
  'dateRange',
  'tags',
  'tagsRelation',
  'entities',
  'entitiesRelation',
  'status',
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
  status?: PostStatus;
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
  entities?: string[];
  tags?: string[];
  tagsRelation?: 'and' | 'or';
  entitiesRelation?: 'and' | 'or';
  status?: PostStatus;
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
  value?: string | string[];
};

export interface CommonFilterPanelProps {
  showEntityFilter?: boolean;
  showTagFilter?: boolean;
  answerFilters?: boolean;
  type?: PostType;
}

export interface FilterPanelProps<T extends Filters>
  extends CommonFilterPanelProps {
  onChange: (changes: Change<T> | Change<T>[]) => void;
  filters: T;
}

const useStyles = makeStyles(
  theme => ({
    root: {
      padding: '1em',
      paddingTop: '2em',
      marginTop: '1em',
      border: `1px solid ${theme.palette.divider}`,
    },
  }),
  { name: 'QetaFilterPanel' },
);

export const FilterPanel = <T extends Filters>(props: FilterPanelProps<T>) => {
  const {
    onChange,
    filters,
    showEntityFilter = true,
    showTagFilter = true,
    type,
  } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const [entities, setEntities] = useState<Entity[] | undefined>(undefined);
  const [starredEntities, setStarredEntities] = useState(false);
  const [ownedEntities, setOwnedEntities] = useState(false);
  const [ownedEntityRefs, setOwnedEntityRefs] = useState<string[]>([]);
  const starredEntitiesApi = useStarredEntities();
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const styles = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  // Initialize filters from URL parameters only once
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const changes: Change<T>[] = [];
    searchParams.forEach((value, key) => {
      if (!value) {
        return;
      }
      if (filterKeys.includes(key as FilterKey)) {
        if (key === 'tags' || key === 'entities') {
          changes.push({ key: key as keyof T, value: value.split(',') });
        } else {
          changes.push({ key: key as keyof T, value });
        }
      }
    });
    if (changes.length > 0) {
      onChange(changes);
    }
  }, [searchParams, onChange]);

  // Handle owned entities
  useEffect(() => {
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
          setOwnedEntityRefs(entityRefs);
        });
    });
  }, [catalogApi, identityApi]);

  const handleChange = (event: {
    target: {
      value?: string | string[];
      type?: string;
      name: string;
      checked?: boolean;
    };
  }) => {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked ? 'true' : 'false';
    }

    // Update URL parameters
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (
        !value ||
        value === 'false' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newParams.delete(event.target.name);
      } else if (Array.isArray(value)) {
        newParams.set(event.target.name, value.join(','));
      } else {
        newParams.set(event.target.name, value);
      }
      return newParams;
    });

    onChange({ key: event.target.name as keyof T, value });
  };

  const handleStarredEntities = useCallback(
    (checked: boolean) => {
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
    },
    [onChange, starredEntitiesApi.starredEntities],
  );

  const handleOwnedEntities = useCallback(
    (checked: boolean) => {
      setOwnedEntities(checked);
      setEntities([]);
      if (checked) {
        onChange([
          { key: 'entities', value: ownedEntityRefs },
          { key: 'entitiesRelation', value: 'or' },
        ]);
      } else {
        onChange([
          { key: 'entities', value: [] },
          { key: 'entitiesRelation', value: 'and' },
        ]);
      }
    },
    [onChange, ownedEntityRefs],
  );

  useEffect(() => {
    if (filters.entities) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: filters.entities,
          fields: ['kind', 'metadata.name', 'metadata.namespace'],
        })
        .then(data => {
          setEntities(compact(data.items));
        });
    }
  }, [catalogApi, filters.entities]);

  const postFilters = isPostFilters(filters);
  const answerFilters = isAnswerFilters(filters);
  const collectionFilters = isCollectionFilters(filters);

  return (
    <Box className={styles.root}>
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
              {postFilters && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="status"
                      onChange={e => {
                        const newStatus = e.target.checked
                          ? 'draft'
                          : undefined;
                        handleChange({
                          target: { name: 'status', value: newStatus },
                        });
                      }}
                      checked={filters.status === 'draft'}
                    />
                  }
                  label={t('filterPanel.drafts.label')}
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
                gap: '0 1em',
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
                  style={{ width: '230px' }}
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
              {entities && entities?.length > 1 && (
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
                  style={{ width: '230px' }}
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
