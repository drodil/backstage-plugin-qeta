import { getEntityDescription, getEntityTitle } from '../../utils/utils';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  Box,
  Tag,
  TagGroup,
  TextField,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  CSSProperties,
  FocusEvent,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { qetaApiRef } from '../../api';
import { compact } from 'lodash';
import { FieldError } from 'react-hook-form';
import type { CatalogApi } from '@backstage/catalog-client';
import type {
  EntitiesQuery,
  QetaApi,
} from '@drodil/backstage-plugin-qeta-common';
import { getSupportedEntityKinds } from '@drodil/backstage-plugin-qeta-common';
import { useDebounce } from 'react-use';
import { useQetaConfig } from '../../hooks';
import styles from './EntitiesInput.module.css';

type CommonEntitiesInputProps = {
  singleValue?: string;
  required?: boolean;
  useOnlyUsedEntities?: boolean;
  hideHelpText?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  kind?: string[];
  maximum?: number | null;
  error?: FieldError;
  label?: string;
  name?: string;
  placeholder?: string;
  onChange: (value: any) => void;
  title?: string;
  content?: string;
  tags?: string[];
  skipDisabledEntitiesCheck?: boolean;
};
type SingleEntitiesInputValue = CommonEntitiesInputProps & {
  multiple: false;
  value?: Entity | null;
  onChange: (value: Entity) => void;
};

type MultipleEntitiesInputValue = CommonEntitiesInputProps & {
  multiple?: true;
  value?: Entity[];
  onChange: (value: Entity[]) => void;
};

export type EntitiesInputProps =
  | SingleEntitiesInputValue
  | MultipleEntitiesInputValue;

const CATALOG_FIELDS = [
  'kind',
  'metadata.name',
  'metadata.namespace',
  'metadata.title',
  'metadata.description',
  'spec.type',
  'spec.profile.displayName',
  'spec.profile.email',
];

const CATALOG_SEARCH_FIELDS = [
  'metadata.name',
  'metadata.title',
  'spec.profile.displayName',
  'spec.profile.email',
];

const CATALOG_DEFAULT_ORDER_FIELDS = [
  {
    field: 'metadata.name',
    order: 'asc' as const,
  },
];

const ENTITY_SEARCH_LIMIT = 25;
const ENTITY_KIND_KEY_SEPARATOR = '\u0000';

const getEntityKindsKey = (entityKinds: string[]) =>
  [...entityKinds]
    .sort((left, right) => left.localeCompare(right))
    .join(ENTITY_KIND_KEY_SEPARATOR);

const getEntityKindsFromKey = (entityKindsKey: string) =>
  entityKindsKey ? entityKindsKey.split(ENTITY_KIND_KEY_SEPARATOR) : [];

type EntitySearchQuery = {
  kind: string | { $in: string[] };
};

const getEntitySearchQuery = (
  entityKinds: string[],
): EntitySearchQuery | undefined => {
  if (entityKinds.length === 0) {
    return undefined;
  }

  if (entityKinds.length === 1) {
    return { kind: entityKinds[0] };
  }

  return {
    kind: {
      $in: entityKinds,
    },
  };
};

const getEntitySearchCacheScope = (
  term: string,
  useOnlyUsedEntities: boolean,
  hasExplicitKinds: boolean,
) => {
  if (!term) {
    return hasExplicitKinds ? 'catalog-defaults' : 'used-defaults';
  }

  if (useOnlyUsedEntities) {
    return 'used';
  }

  return 'catalog';
};

const getUsedEntitiesRequest = (term: string): EntitiesQuery => ({
  limit: ENTITY_SEARCH_LIMIT,
  orderBy: 'postsCount',
  order: 'desc',
  ...(term ? { searchQuery: term } : {}),
});

const loadUsedEntities = async (params: {
  catalogQuery?: EntitySearchQuery;
  getEntities: QetaApi['getEntities'];
  getEntitiesByRefs: CatalogApi['getEntitiesByRefs'];
  term: string;
}) => {
  const { catalogQuery, getEntities, getEntitiesByRefs, term } = params;
  const qetaEntities = await getEntities(getUsedEntitiesRequest(term));
  const refs = qetaEntities.entities.map(entity => entity.entityRef);

  if (refs.length === 0) {
    return [];
  }

  const catalogData = await getEntitiesByRefs({
    entityRefs: refs,
    fields: CATALOG_FIELDS,
    ...(catalogQuery ? { query: catalogQuery } : {}),
  });

  return compact(catalogData.items);
};

const loadCatalogEntities = async (params: {
  catalogQuery: EntitySearchQuery;
  queryEntities: CatalogApi['queryEntities'];
  term: string;
}) => {
  const { catalogQuery, queryEntities, term } = params;
  const request: NonNullable<Parameters<CatalogApi['queryEntities']>[0]> = {
    query: catalogQuery,
    limit: ENTITY_SEARCH_LIMIT,
    fields: CATALOG_FIELDS,
    orderFields: CATALOG_DEFAULT_ORDER_FIELDS,
  };

  if (term) {
    request.fullTextFilter = {
      term,
      fields: CATALOG_SEARCH_FIELDS,
    };
  }

  const entities = await queryEntities(request);

  return compact(entities.items);
};

const mergeEntities = (...groups: Array<Array<Entity | null | undefined>>) => {
  const seen = new Set<string>();
  const merged: Entity[] = [];

  for (const entity of groups.flat()) {
    if (!entity) {
      continue;
    }

    const entityRef = stringifyEntityRef(entity);
    if (!seen.has(entityRef)) {
      seen.add(entityRef);
      merged.push(entity);
    }
  }

  return merged;
};

const getCurrentValueEntities = (value: Entity | Entity[] | null | undefined) =>
  [value ?? []].flat() as Entity[];

const handleEntitySelectionChange = ({
  max,
  multiple,
  newValue,
  onChange,
}: {
  max: number | null;
  multiple: boolean;
  newValue: Entity | string | Array<Entity | string> | null;
  onChange: (value: any) => void;
}) => {
  if (multiple) {
    if (!newValue) {
      onChange([]);
      return;
    }

    const values = Array.isArray(newValue) ? newValue : [newValue];
    if (max === null || values.length <= max) {
      onChange(values.filter(v => typeof v !== 'string'));
    }
    return;
  }

  if (newValue) {
    onChange(newValue);
  }
};

const appendSuggestedEntity = ({
  entity,
  max,
  values,
}: {
  entity: Entity;
  max: number | null;
  values: Entity[];
}) => {
  if (values.includes(entity)) {
    return undefined;
  }

  if (max !== null && values.length >= max) {
    return undefined;
  }

  return [...values, entity];
};

export const EntitiesInput = forwardRef<any, EntitiesInputProps>(
  (props, _ref) => {
    const {
      value,
      singleValue,
      onChange,
      multiple = true,
      required = false,
      useOnlyUsedEntities = false,
      hideHelpText = false,
      style,
      disabled,
      kind,
      error,
      maximum,
      label,
      name = 'entities',
      placeholder,
      title,
      content,
      tags,
      skipDisabledEntitiesCheck = false,
    } = props;

    const configApi = useApi(configApiRef);
    const catalogApi = useApi(catalogApiRef);
    const qetaApi = useApi(qetaApiRef);
    const [availableEntities, setAvailableEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { t } = useTranslationRef(qetaTranslationRef);
    const [suggestedEntities, setSuggestedEntities] = useState<Entity[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const searchCache = useRef<Map<string, Entity[]>>(new Map());
    const activeRequest = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const qetaConfig = useQetaConfig();

    const explicitEntityKindsKey = useMemo(
      () => getEntityKindsKey(kind ?? []),
      [kind],
    );

    const entityKinds: string[] = useMemo(() => {
      if (explicitEntityKindsKey) {
        return getEntityKindsFromKey(explicitEntityKindsKey);
      }
      return getSupportedEntityKinds(configApi);
    }, [configApi, explicitEntityKindsKey]);
    const max = useMemo(() => {
      if (maximum) {
        return maximum;
      }
      return configApi.getOptionalNumber('qeta.entities.max') ?? 3;
    }, [configApi, maximum]);
    const entityKindsKey = useMemo(
      () => getEntityKindsKey(entityKinds),
      [entityKinds],
    );
    const hasExplicitKinds = explicitEntityKindsKey.length > 0;

    const valueEntities = useMemo(
      () => getCurrentValueEntities(value),
      [value],
    );

    const helperText = useMemo(
      () =>
        hideHelpText
          ? ''
          : (error?.message ??
            t('entitiesInput.helperText', {
              max: max?.toString() ?? '',
            })),
      [error?.message, hideHelpText, max, t],
    );

    const usedValue = useMemo(() => {
      if (!value) {
        return multiple ? [] : null;
      }
      return value;
    }, [value, multiple]);

    const selectedEntities = useMemo(
      () => mergeEntities(Array.isArray(usedValue) ? usedValue : [usedValue]),
      [usedValue],
    );

    const options = useMemo(
      () => mergeEntities(selectedEntities, availableEntities),
      [availableEntities, selectedEntities],
    );

    const displayedInputValue = useMemo(() => {
      if (!multiple && !open && usedValue && !Array.isArray(usedValue)) {
        return getEntityTitle(usedValue);
      }

      return inputValue;
    }, [inputValue, multiple, open, usedValue]);

    const filteredOptions = useMemo(() => {
      const term = inputValue.trim().toLocaleLowerCase();
      const selectedRefs = new Set(selectedEntities.map(stringifyEntityRef));
      return options.filter(option => {
        if (selectedRefs.has(stringifyEntityRef(option))) {
          return false;
        }
        if (!term) {
          return true;
        }
        return getEntityTitle(option, { withType: false })
          .toLocaleLowerCase()
          .includes(term);
      });
    }, [inputValue, options, selectedEntities]);

    useEffect(() => {
      searchCache.current.clear();
      activeRequest.current += 1;
      setAvailableEntities([]);
      setInputValue('');
      setLoading(false);
    }, [entityKindsKey, singleValue, useOnlyUsedEntities]);

    useEffect(() => {
      if (!singleValue) {
        return undefined;
      }

      if (
        selectedEntities.some(
          entity => stringifyEntityRef(entity) === singleValue,
        )
      ) {
        return undefined;
      }

      let active = true;
      catalogApi
        .getEntityByRef(singleValue)
        .then(entity => {
          if (!active || !entity) {
            return;
          }
          setAvailableEntities(prev => mergeEntities([entity], prev));
        })
        .catch(() => {
          // Ignore errors
        });

      return () => {
        active = false;
      };
    }, [catalogApi, selectedEntities, singleValue]);

    const searchEntities = useCallback(
      async (term: string) => {
        const trimmed = term.trim();
        const currentEntityKinds = getEntityKindsFromKey(entityKindsKey);
        const catalogQuery = getEntitySearchQuery(currentEntityKinds);
        const shouldLoadCatalogDefaults = !trimmed && hasExplicitKinds;
        const shouldLoadUsedEntities =
          useOnlyUsedEntities || (!trimmed && !hasExplicitKinds);

        const cacheKey = [
          getEntitySearchCacheScope(
            trimmed,
            useOnlyUsedEntities,
            hasExplicitKinds,
          ),
          entityKindsKey,
          trimmed.toLocaleLowerCase(),
        ].join(':');
        const cached = searchCache.current.get(cacheKey);

        if (cached) {
          setLoading(false);
          setAvailableEntities(prev => mergeEntities(prev, cached));
          return;
        }

        const requestId = activeRequest.current + 1;
        activeRequest.current = requestId;
        setLoading(true);

        try {
          let nextEntities: Entity[] = [];

          if (shouldLoadCatalogDefaults && catalogQuery) {
            nextEntities = await loadCatalogEntities({
              catalogQuery,
              queryEntities: request => catalogApi.queryEntities(request),
              term: '',
            });
          } else if (shouldLoadUsedEntities) {
            nextEntities = await loadUsedEntities({
              catalogQuery,
              getEntities: entityOptions => qetaApi.getEntities(entityOptions),
              getEntitiesByRefs: request =>
                catalogApi.getEntitiesByRefs(request),
              term: trimmed,
            });

            // Fall back to catalog defaults when there are no previously-used
            // entities yet, instead of leaving the dropdown empty. Only applies
            // to the implicit default load (not when useOnlyUsedEntities is set).
            if (
              nextEntities.length === 0 &&
              !useOnlyUsedEntities &&
              catalogQuery
            ) {
              nextEntities = await loadCatalogEntities({
                catalogQuery,
                queryEntities: request => catalogApi.queryEntities(request),
                term: trimmed,
              });
            }
          } else if (catalogQuery) {
            nextEntities = await loadCatalogEntities({
              catalogQuery,
              queryEntities: request => catalogApi.queryEntities(request),
              term: trimmed,
            });
          }

          if (activeRequest.current !== requestId) {
            return;
          }

          searchCache.current.set(cacheKey, nextEntities);
          setAvailableEntities(prev => mergeEntities(prev, nextEntities));
        } catch {
          // Keep already fetched entities visible on request failures.
        } finally {
          if (activeRequest.current === requestId) {
            setLoading(false);
          }
        }
      },
      [
        catalogApi,
        entityKindsKey,
        hasExplicitKinds,
        qetaApi,
        useOnlyUsedEntities,
      ],
    );

    const handleOpen = useCallback(() => {
      setInputValue('');
      setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
      activeRequest.current += 1;
      setLoading(false);
      setInputValue('');
      setOpen(false);
    }, []);

    useEffect(() => {
      searchEntities('');
    }, [searchEntities]);

    useDebounce(
      () => {
        if (open) {
          searchEntities(inputValue);
        }
      },
      300,
      [inputValue, open, searchEntities],
    );

    useDebounce(
      () => {
        if (title && content) {
          setLoadingSuggestions(true);
          qetaApi
            .getEntitySuggestions({
              title,
              content,
              tags,
              entities: valueEntities.map(stringifyEntityRef),
              limit: 5,
            })
            .then(response => {
              setSuggestedEntities(response.entities);
            })
            .catch(() => {
              // Ignore errors
            })
            .finally(() => {
              setLoadingSuggestions(false);
            });
        }
      },
      2000,
      [content, qetaApi, tags, title, valueEntities],
    );

    const handleSuggestedEntityClick = (entity: Entity) => {
      const nextValues = appendSuggestedEntity({
        entity,
        max,
        values: valueEntities,
      });

      if (nextValues) {
        onChange(nextValues);
      }
    };

    const handleSelect = (entity: Entity) => {
      const entityRef = stringifyEntityRef(entity);
      if (multiple) {
        const alreadySelected = valueEntities.some(
          e => stringifyEntityRef(e) === entityRef,
        );
        const nextValues = alreadySelected
          ? valueEntities.filter(e => stringifyEntityRef(e) !== entityRef)
          : [...valueEntities, entity];
        handleEntitySelectionChange({
          max,
          multiple,
          newValue: nextValues,
          onChange,
        });
        setInputValue('');
      } else {
        handleEntitySelectionChange({
          max,
          multiple,
          newValue: entity,
          onChange,
        });
        setInputValue('');
        setOpen(false);
      }
    };

    const handleRemoveEntities = (keys: Iterable<string | number>) => {
      const removed = new Set(Array.from(keys).map(String));
      onChange(valueEntities.filter(e => !removed.has(stringifyEntityRef(e))));
    };

    const handleFieldBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (!containerRef.current?.contains(event.relatedTarget)) {
        handleClose();
      }
    };

    if (qetaConfig.disabled.entities && !skipDisabledEntitiesCheck) {
      return null;
    }

    const showGroups = entityKinds.length > 1;
    const groupedOptions = showGroups
      ? entityKinds
          .map(entityKind => ({
            kind: entityKind,
            entities: filteredOptions.filter(
              option => option.kind.toLocaleLowerCase() === entityKind,
            ),
          }))
          .filter(group => group.entities.length > 0)
      : [{ kind: '', entities: filteredOptions }];

    const tagItems = valueEntities.map(entity => ({
      id: stringifyEntityRef(entity),
      entity,
    }));

    return (
      <Box className={styles.root}>
        <div ref={containerRef} className={styles.container}>
          <div className={styles.fieldWrapper}>
            <TextField
              className="qetaEntitiesInput"
              isDisabled={disabled}
              isRequired={required}
              label={label || t('entitiesInput.label')}
              placeholder={placeholder || t('entitiesInput.placeholder')}
              description={helperText}
              isInvalid={error !== undefined}
              name={name}
              style={style}
              value={displayedInputValue}
              onChange={value_ => setInputValue(value_)}
              onFocus={handleOpen}
              onBlur={handleFieldBlur}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  handleClose();
                }
              }}
            />
            {multiple && tagItems.length > 0 && (
              <TagGroup
                className={styles.chips}
                items={tagItems}
                onRemove={handleRemoveEntities}
              >
                {item => (
                  <Tag>{getEntityTitle(item.entity, { withType: false })}</Tag>
                )}
              </TagGroup>
            )}
            {open && (
              <div className={styles.dropdown}>
                {loading && (
                  <div className={styles.statusText}>{t('common.loading')}</div>
                )}
                {!loading &&
                  groupedOptions.map(group => (
                    <div key={group.kind || 'default'}>
                      {showGroups && group.entities.length > 0 && (
                        <div className={styles.groupHeader}>{group.kind}</div>
                      )}
                      {group.entities.map(option => {
                        const stringified = stringifyEntityRef(option);
                        return (
                          <TooltipTrigger key={stringified}>
                            <button
                              type="button"
                              className={styles.option}
                              onMouseDown={event => event.preventDefault()}
                              onClick={() => handleSelect(option)}
                            >
                              {getEntityTitle(option, { withType: false })}
                            </button>
                            <Tooltip placement="right">
                              {getEntityTitle(option)}
                              {getEntityDescription(option)
                                ? ` — ${getEntityDescription(option)}`
                                : ''}
                            </Tooltip>
                          </TooltipTrigger>
                        );
                      })}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        {suggestedEntities?.length > 0 && (
          <Box className={styles.suggestedSection}>
            <span className={styles.suggestedLabel}>
              {t('entitiesInput.suggestedEntities')}
            </span>
            <TagGroup
              className={styles.suggestedChips}
              items={suggestedEntities.map(entity => ({
                id: stringifyEntityRef(entity),
                entity,
              }))}
            >
              {item => (
                <Tag
                  isDisabled={
                    valueEntities
                      .map(stringifyEntityRef)
                      .includes(stringifyEntityRef(item.entity)) ||
                    (max !== null && valueEntities.length >= max) ||
                    loadingSuggestions
                  }
                  onAction={() => handleSuggestedEntityClick(item.entity)}
                >
                  {getEntityTitle(item.entity)}
                </Tag>
              )}
            </TagGroup>
          </Box>
        )}
      </Box>
    );
  },
);

EntitiesInput.displayName = 'EntitiesInput';
