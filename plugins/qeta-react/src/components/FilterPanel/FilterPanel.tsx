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
  ButtonIcon,
  Checkbox,
  Flex,
  Grid,
  Radio,
  RadioGroup,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiEqualizerLine,
  RiFilterLine,
  RiFocusLine,
  RiCheckboxBlankCircleFill,
  RiSortDesc,
  RiArrowUpDownLine,
} from '@remixicon/react';
import { compact } from 'lodash';
import styles from './FilterPanel.module.css';

const radioSelect = (value: string, label: string) => {
  return <Radio value={value}>{label}</Radio>;
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
  author?: string;
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
  orderBy?:
    | 'created'
    | 'title'
    | 'postsCount'
    | 'questionsCount'
    | 'articlesCount'
    | 'linksCount'
    | 'followerCount';
};

export type TagFilters = Filters & {
  orderBy?:
    | 'postsCount'
    | 'questionsCount'
    | 'articlesCount'
    | 'linksCount'
    | 'followerCount'
    | 'tag';
};

export type EntityFilters = Filters & {
  orderBy?:
    | 'postsCount'
    | 'questionsCount'
    | 'articlesCount'
    | 'linksCount'
    | 'followerCount'
    | 'entityRef';
};

export type UserFilters = Filters & {
  orderBy?:
    | 'totalPosts'
    | 'totalQuestions'
    | 'totalAnswers'
    | 'totalArticles'
    | 'totalLinks'
    | 'totalViews'
    | 'totalVotes'
    | 'followerCount'
    | 'reputation'
    | 'userRef';
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
  mode?: 'posts' | 'collections' | 'tags' | 'entities' | 'users';
}

export interface FilterPanelProps<
  T extends Filters,
> extends CommonFilterPanelProps {
  onChange: (changes: Change<T> | Change<T>[]) => void;
  filters: T;
}

export const FilterPanel = <T extends Filters>(props: FilterPanelProps<T>) => {
  const {
    onChange,
    filters,
    showEntityFilter = true,
    showTagFilter = true,
    type,
    mode = 'posts',
  } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const [entities, setEntities] = useState<Entity[] | undefined>(undefined);
  const [starredEntities, setStarredEntities] = useState(false);
  const [ownedEntities, setOwnedEntities] = useState(false);
  const [ownedEntityRefs, setOwnedEntityRefs] = useState<string[]>([]);
  const starredEntitiesApi = useStarredEntities();
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
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
        .queryEntities({
          query: {
            'spec.owner': { $in: identity.ownershipEntityRefs },
          },
          fields: ['kind', 'metadata.name', 'metadata.namespace'],
        })
        .then(data => {
          const entityRefs = data.items.map(e => stringifyEntityRef(e));
          setOwnedEntityRefs(entityRefs);
        });
    });
  }, [catalogApi, identityApi]);

  const updateFilter = (name: keyof T, value?: string | string[]) => {
    // Update URL parameters
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (
        !value ||
        value === 'false' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newParams.delete(name as string);
      } else if (Array.isArray(value)) {
        newParams.set(name as string, value.join(','));
      } else {
        newParams.set(name as string, value);
      }
      return newParams;
    });

    onChange({ key: name, value });
  };

  const updateCheckboxFilter = (name: keyof T, checked: boolean) => {
    updateFilter(name, checked ? 'true' : 'false');
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

  const showBottomSection =
    mode !== 'tags' && mode !== 'entities' && mode !== 'users';

  return (
    <Box className={styles.root}>
      <Grid.Root columns={{ initial: '1', md: '12' }} gap="4">
        {(postFilters || answerFilters) && (
          <Grid.Item colSpan={{ initial: '1', md: '4' }}>
            <Flex align="center" gap="1" className={styles.label}>
              <RiFilterLine size={16} />
              <Text as="span" variant="body-small" weight="bold">
                {t('filterPanel.quickFilters.label')}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              {postFilters && type === 'question' && (
                <Checkbox
                  isSelected={filters.noAnswers === 'true'}
                  onChange={checked =>
                    updateCheckboxFilter('noAnswers' as keyof T, checked)
                  }
                >
                  {t('filterPanel.noAnswers.label')}
                </Checkbox>
              )}
              {postFilters && (
                <Checkbox
                  isSelected={filters.status === 'draft'}
                  onChange={checked =>
                    updateFilter('status', checked ? 'draft' : undefined)
                  }
                >
                  {t('filterPanel.drafts.label')}
                </Checkbox>
              )}
              {(postFilters || answerFilters) && type === 'question' && (
                <Checkbox
                  isSelected={filters.noCorrectAnswer === 'true'}
                  onChange={checked =>
                    updateCheckboxFilter('noCorrectAnswer' as keyof T, checked)
                  }
                >
                  {t('filterPanel.noCorrectAnswers.label')}
                </Checkbox>
              )}
              {(postFilters || answerFilters) && type !== 'link' && (
                <Checkbox
                  isSelected={filters.noVotes === 'true'}
                  onChange={checked =>
                    updateCheckboxFilter('noVotes' as keyof T, checked)
                  }
                >
                  {t('filterPanel.noVotes.label')}
                </Checkbox>
              )}
              {starredEntitiesApi.starredEntities.size > 0 && (
                <Checkbox
                  isSelected={starredEntities}
                  onChange={handleStarredEntities}
                >
                  {t('filterPanel.starredEntities.label')}
                </Checkbox>
              )}
              <Checkbox
                isSelected={ownedEntities}
                onChange={handleOwnedEntities}
              >
                {t('filterPanel.ownedEntities.label')}
              </Checkbox>
            </Flex>
          </Grid.Item>
        )}
        <Grid.Item colSpan={{ initial: '1', md: '5' }}>
          <Flex align="center" gap="1" className={styles.label}>
            <RiSortDesc size={16} />
            <Text as="span" variant="body-small" weight="bold">
              {t('filterPanel.orderBy.label')}
            </Text>
          </Flex>
          <RadioGroup
            aria-label={t('filterPanel.orderBy.label')}
            value={filters.orderBy ?? null}
            onChange={value => updateFilter('orderBy', value)}
            className={styles.orderByGroup}
          >
            {postFilters &&
              filters.collectionId !== undefined &&
              radioSelect('rank', t('filterPanel.orderBy.rank'))}
            {mode !== 'users' &&
              mode !== 'tags' &&
              mode !== 'entities' &&
              radioSelect('created', t('filterPanel.orderBy.created'))}
            {(postFilters || collectionFilters) &&
              mode !== 'tags' &&
              mode !== 'entities' &&
              mode !== 'users' &&
              radioSelect('title', t('filterPanel.orderBy.title'))}
            {postFilters &&
              type !== 'link' &&
              radioSelect('views', t('filterPanel.orderBy.views'))}
            {(postFilters || answerFilters) &&
              radioSelect(
                'score',
                type !== 'link'
                  ? t('filterPanel.orderBy.score')
                  : t('filterPanel.orderBy.clicks'),
              )}
            {postFilters &&
              radioSelect('trend', t('filterPanel.orderBy.trend'))}
            {postFilters &&
              type === 'question' &&
              radioSelect('answersCount', t('filterPanel.orderBy.answers'))}
            {(postFilters || answerFilters) &&
              radioSelect('updated', t('filterPanel.orderBy.updated'))}

            {mode === 'tags' &&
              radioSelect('tag', t('filterPanel.orderBy.tag'))}
            {mode === 'entities' &&
              radioSelect('entityRef', t('filterPanel.orderBy.entityRef'))}
            {mode === 'users' &&
              radioSelect('userRef', t('filterPanel.orderBy.user'))}

            {(mode === 'tags' ||
              mode === 'entities' ||
              mode === 'collections') &&
              radioSelect('postsCount', t('filterPanel.orderBy.posts'))}
            {(mode === 'tags' ||
              mode === 'entities' ||
              mode === 'collections') &&
              radioSelect('questionsCount', t('filterPanel.orderBy.questions'))}
            {(mode === 'tags' ||
              mode === 'entities' ||
              mode === 'collections') &&
              radioSelect('articlesCount', t('filterPanel.orderBy.articles'))}
            {(mode === 'tags' ||
              mode === 'entities' ||
              mode === 'collections') &&
              radioSelect('linksCount', t('filterPanel.orderBy.links'))}
            {(mode === 'tags' ||
              mode === 'entities' ||
              mode === 'users' ||
              mode === 'collections') &&
              radioSelect('followerCount', t('filterPanel.orderBy.followers'))}

            {mode === 'users' &&
              radioSelect('totalPosts', t('filterPanel.orderBy.posts'))}
            {mode === 'users' &&
              radioSelect('totalQuestions', t('filterPanel.orderBy.questions'))}
            {mode === 'users' &&
              radioSelect('totalAnswers', t('filterPanel.orderBy.answers'))}
            {mode === 'users' &&
              radioSelect('totalArticles', t('filterPanel.orderBy.articles'))}
            {mode === 'users' &&
              radioSelect('totalLinks', t('filterPanel.orderBy.links'))}
            {mode === 'users' &&
              radioSelect('totalViews', t('filterPanel.orderBy.views'))}
            {mode === 'users' &&
              radioSelect('totalVotes', t('filterPanel.orderBy.votes'))}
            {mode === 'users' &&
              radioSelect('reputation', t('filterPanel.orderBy.reputation'))}
          </RadioGroup>
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '1', md: '3' }}>
          <Flex align="center" gap="1" className={styles.label}>
            <RiArrowUpDownLine size={16} />
            <Text as="span" variant="body-small" weight="bold">
              {t('filterPanel.order.label')}
            </Text>
          </Flex>
          <RadioGroup
            aria-label={t('filterPanel.order.label')}
            value={filters.order ?? null}
            onChange={value => updateFilter('order', value)}
          >
            {radioSelect('desc', t('filterPanel.order.desc'))}
            {radioSelect('asc', t('filterPanel.order.asc'))}
          </RadioGroup>
        </Grid.Item>
      </Grid.Root>
      {showBottomSection && (
        <>
          <div className={styles.divider} />
          <Flex align="center" gap="1" className={styles.label}>
            <RiEqualizerLine size={16} />
            <Text as="span" variant="body-small" weight="bold">
              {t('filterPanel.filters.label')}
            </Text>
          </Flex>
          <Grid.Root columns={{ initial: '1', md: '12' }} gap="2">
            <Grid.Item colSpan={{ initial: '1', md: '4' }}>
              <DateRangeFilter
                value={filters.dateRange}
                onChange={val => onChange({ key: 'dateRange', value: val })}
              />
            </Grid.Item>
            {showEntityFilter && (
              <Grid.Item colSpan={{ initial: '1', md: '4' }}>
                <Flex align="center" gap="1">
                  <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <EntitiesInput
                      disabled={starredEntities || ownedEntities}
                      style={{ width: '100%' }}
                      onChange={(newEntities?: Entity[]) => {
                        const entityRefs = (newEntities ?? []).map(e =>
                          stringifyEntityRef(e),
                        );
                        updateFilter('entities', entityRefs);
                        setEntities(newEntities);
                      }}
                      value={entities}
                      useOnlyUsedEntities
                      hideHelpText
                    />
                  </Box>
                  {entities && entities?.length > 1 && (
                    <TooltipTrigger>
                      <ButtonIcon
                        aria-label={
                          filters.entitiesRelation === 'or'
                            ? t('filterPanel.toggleEntityRelation.and')
                            : t('filterPanel.toggleEntityRelation.or')
                        }
                        variant="tertiary"
                        size="small"
                        isDisabled={starredEntities || ownedEntities}
                        icon={
                          filters.entitiesRelation === 'or' ? (
                            <RiFocusLine size={16} />
                          ) : (
                            <RiCheckboxBlankCircleFill size={16} />
                          )
                        }
                        onPress={() => {
                          onChange({
                            key: 'entitiesRelation',
                            value:
                              filters.entitiesRelation === 'or' ? 'and' : 'or',
                          });
                        }}
                      />
                      <Tooltip>
                        {filters.entitiesRelation === 'or'
                          ? t('filterPanel.toggleEntityRelation.and')
                          : t('filterPanel.toggleEntityRelation.or')}
                      </Tooltip>
                    </TooltipTrigger>
                  )}
                </Flex>
              </Grid.Item>
            )}
            {showTagFilter && (
              <Grid.Item colSpan={{ initial: '1', md: '4' }}>
                <Flex align="center" gap="1">
                  <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <TagInput
                      style={{ width: '100%' }}
                      onChange={(newTags: string[]) =>
                        onChange({ key: 'tags', value: newTags })
                      }
                      value={filters.tags}
                      hideHelpText
                      allowCreate={false}
                    />
                  </Box>
                  {filters.tags && filters.tags?.length > 1 && (
                    <TooltipTrigger>
                      <ButtonIcon
                        aria-label={
                          filters.tagsRelation === 'or'
                            ? t('filterPanel.toggleTagRelation.and')
                            : t('filterPanel.toggleTagRelation.or')
                        }
                        variant="tertiary"
                        size="small"
                        icon={
                          filters.tagsRelation === 'or' ? (
                            <RiFocusLine size={16} />
                          ) : (
                            <RiCheckboxBlankCircleFill size={16} />
                          )
                        }
                        onPress={() => {
                          onChange({
                            key: 'tagsRelation',
                            value: filters.tagsRelation === 'or' ? 'and' : 'or',
                          });
                        }}
                      />
                      <Tooltip>
                        {filters.tagsRelation === 'or'
                          ? t('filterPanel.toggleTagRelation.and')
                          : t('filterPanel.toggleTagRelation.or')}
                      </Tooltip>
                    </TooltipTrigger>
                  )}
                </Flex>
              </Grid.Item>
            )}
          </Grid.Root>
        </>
      )}
    </Box>
  );
};
