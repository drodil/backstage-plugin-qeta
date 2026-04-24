import { Autocomplete } from '@material-ui/lab';
import {
  Box,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  ComponentType,
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { qetaApiRef } from '../../api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  filterTags,
  qetaCreateTagPermission,
  type TagsQuery,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { FieldError } from 'react-hook-form';
import { AutocompleteListboxComponent } from './AutocompleteListComponent';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { useDebounce } from 'react-use';

const TAG_SEARCH_LIMIT = 25;

type CreateTagOption = {
  inputValue: string;
  label: string;
};

type TagAutocompleteOption = string | CreateTagOption;

const isCreateTagOption = (
  option: TagAutocompleteOption,
): option is CreateTagOption => typeof option !== 'string';

const getTagOptionValue = (option: TagAutocompleteOption) =>
  isCreateTagOption(option) ? option.inputValue : option;

const getTagOptionLabel = (option: TagAutocompleteOption) =>
  isCreateTagOption(option) ? option.label : option;

const normalizeTagInput = (input: string) => filterTags([input])[0];

const getTagSearchRequest = (term: string): TagsQuery => ({
  limit: TAG_SEARCH_LIMIT,
  orderBy: 'postsCount',
  order: 'desc',
  ...(term ? { searchQuery: term } : {}),
});

const getMatchingAllowedTags = (allowedTags: string[], term: string) => {
  const normalizedTerm = term.trim().toLocaleLowerCase();

  if (!normalizedTerm) {
    return allowedTags;
  }

  return allowedTags.filter(tag =>
    tag.toLocaleLowerCase().includes(normalizedTerm),
  );
};

const mergeTags = (...groups: string[][]) => {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const tag of groups.flat()) {
    if (!seen.has(tag)) {
      seen.add(tag);
      merged.push(tag);
    }
  }

  return merged;
};

const getTagDescriptions = (
  tags: Array<{ tag: string; description?: string }>,
) =>
  tags.reduce(
    (acc, tag) => {
      if (!tag.description) {
        return acc;
      }
      acc[tag.tag] = tag.description;
      return acc;
    },
    {} as Record<string, string>,
  );

const getFilteredTagOptions = ({
  allowCreation,
  getCreateOptionLabel,
  inputValue,
  maximumTags,
  options,
  selectedTags,
}: {
  allowCreation: boolean;
  getCreateOptionLabel: (tag: string) => string;
  inputValue: string;
  maximumTags: number;
  options: string[];
  selectedTags: string[];
}): TagAutocompleteOption[] => {
  const trimmedInput = inputValue.trim();
  const normalizedInput = trimmedInput.toLocaleLowerCase();
  const filteredOptions = options.filter(option => {
    if (!normalizedInput) {
      return true;
    }

    return option.toLocaleLowerCase().includes(normalizedInput);
  });

  if (!allowCreation || !trimmedInput || selectedTags.length >= maximumTags) {
    return filteredOptions;
  }

  const normalizedTag = normalizeTagInput(trimmedInput);
  if (!normalizedTag) {
    return filteredOptions;
  }

  const tagAlreadyExists = options.some(
    option => option.toLocaleLowerCase() === normalizedTag,
  );
  const tagAlreadySelected = selectedTags.some(
    tag => tag.toLocaleLowerCase() === normalizedTag,
  );

  if (tagAlreadyExists || tagAlreadySelected) {
    return filteredOptions;
  }

  return [
    ...filteredOptions,
    {
      inputValue: trimmedInput,
      label: getCreateOptionLabel(trimmedInput),
    },
  ];
};

export const TagInput = forwardRef<
  any,
  {
    value?: string[];
    onChange: (value: string[]) => void;
    error?: FieldError;
    allowCreate?: boolean;
    hideHelpText?: boolean;
    style?: CSSProperties;
    title?: string;
    name?: string;
    content?: string;
    entities?: string[];
    label?: string;
  }
>((props, _ref) => {
  const {
    value,
    onChange,
    error,
    allowCreate,
    hideHelpText = false,
    style,
    name = 'tags',
    title,
    content,
    entities,
    label,
  } = props;
  const qetaApi = useApi(qetaApiRef);
  const config = useApi(configApiRef);
  const permissions = useApi(permissionApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [allowCreation, setAllowCreation] = useState<boolean | undefined>(
    allowCreate,
  );
  const [loading, setLoading] = useState(true);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchCache = useRef<
    Map<string, { tags: string[]; descriptions: Record<string, string> }>
  >(new Map());
  const activeRequest = useRef(0);

  useEffect(() => {
    if (allowCreate !== undefined) {
      return;
    }

    if (config.getOptionalBoolean('qeta.permissions') === true) {
      permissions
        .authorize({
          permission: qetaCreateTagPermission,
        })
        .catch(_ => setAllowCreation(false))
        .then(res => {
          if (res && res.result === AuthorizeResult.ALLOW) {
            setAllowCreation(true);
          } else {
            setAllowCreation(false);
          }
        });
    } else {
      setAllowCreation(
        config.getOptionalBoolean('qeta.tags.allowCreation') ?? true,
      );
    }
  }, [config, permissions, allowCreate]);

  useDebounce(
    () => {
      if (title && content) {
        setLoadingSuggestions(true);
        qetaApi
          .getTagSuggestions({ title, content, entities, limit: 5 })
          .then(response => {
            setSuggestedTags(response.tags);
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
    [title, content, entities, qetaApi],
  );

  const allowedTags = useMemo(
    () => config.getOptionalStringArray('qeta.tags.allowedTags') ?? [],
    [config],
  );
  const selectedTags = useMemo(() => value ?? [], [value]);
  const maximumTags = useMemo(
    () => config.getOptionalNumber('qeta.tags.max') ?? 5,
    [config],
  );

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagDescriptions, setTagDescriptions] = useState<
    Record<string, string>
  >({});

  const loadTags = useMemo(
    () => async (term: string) => {
      const trimmed = term.trim();
      const cacheKey = trimmed.toLocaleLowerCase();
      const matchingAllowedTags = getMatchingAllowedTags(allowedTags, trimmed);
      const cached = searchCache.current.get(cacheKey);

      if (cached) {
        setLoading(false);
        setAvailableTags(prev =>
          mergeTags(prev, cached.tags, matchingAllowedTags),
        );
        setTagDescriptions(prev => ({
          ...prev,
          ...cached.descriptions,
        }));
        return;
      }

      const requestId = activeRequest.current + 1;
      activeRequest.current = requestId;
      setLoading(true);

      try {
        const data = await qetaApi.getTags(getTagSearchRequest(trimmed));
        const remoteTags = data.tags.map(tag => tag.tag);
        const descriptions = getTagDescriptions(data.tags);
        const nextTags = mergeTags(remoteTags, matchingAllowedTags);

        if (activeRequest.current !== requestId) {
          return;
        }

        searchCache.current.set(cacheKey, {
          tags: remoteTags,
          descriptions,
        });
        setAvailableTags(prev => mergeTags(prev, nextTags));
        setTagDescriptions(prev => ({ ...prev, ...descriptions }));
      } catch {
        if (activeRequest.current === requestId) {
          setAvailableTags(prev => mergeTags(prev, matchingAllowedTags));
        }
      } finally {
        if (activeRequest.current === requestId) {
          setLoading(false);
        }
      }
    },
    [allowedTags, qetaApi],
  );

  useEffect(() => {
    searchCache.current.clear();
    activeRequest.current += 1;
    setLoading(true);
    loadTags('');
  }, [loadTags]);

  useDebounce(
    () => {
      loadTags(inputValue);
    },
    300,
    [inputValue, loadTags],
  );

  if (allowCreation === false && !loading && availableTags.length === 0) {
    return null;
  }

  const getHelperText = () => {
    if (hideHelpText) {
      return '';
    }

    const baseText = t('tagsInput.helperText', {
      max: maximumTags.toString(10),
    });

    if (!allowCreation) {
      return baseText;
    }
    return `${baseText}. ${t('tagsInput.allowAddHelperText')}`;
  };

  const handleSuggestedTagClick = (tag: string) => {
    if (value && value.length < maximumTags && !value.includes(tag)) {
      onChange([...value, tag]);
    }
  };

  return (
    <Box>
      <Autocomplete
        multiple
        id="tags-select"
        className="qetaTagInput"
        value={selectedTags as TagAutocompleteOption[]}
        loading={loading}
        autoHighlight
        autoComplete
        loadingText={t('common.loading')}
        options={availableTags as TagAutocompleteOption[]}
        freeSolo={allowCreation}
        handleHomeEndKeys
        limitTags={maximumTags}
        getOptionLabel={getTagOptionLabel}
        filterOptions={(options, state) =>
          getFilteredTagOptions({
            allowCreation: allowCreation === true,
            getCreateOptionLabel: tag =>
              t('tagsInput.createOption' as never, { tag } as never) as string,
            inputValue: state.inputValue,
            maximumTags,
            options: options.filter(
              (option): option is string => typeof option === 'string',
            ),
            selectedTags,
          })
        }
        inputValue={inputValue}
        onInputChange={(_event, nextValue, reason) => {
          if (reason === 'reset') {
            setInputValue('');
            return;
          }

          setInputValue(nextValue);
        }}
        ListboxComponent={
          AutocompleteListboxComponent as ComponentType<
            HTMLAttributes<HTMLElement>
          >
        }
        disableListWrap
        style={style}
        renderOption={option => {
          if (isCreateTagOption(option)) {
            return option.label;
          }

          if (tagDescriptions[option]) {
            return (
              <span key={option}>
                <Tooltip
                  arrow
                  placement="right"
                  title={<Typography>{tagDescriptions[option]}</Typography>}
                >
                  <span>{option}</span>
                </Tooltip>
              </span>
            );
          }
          return option;
        }}
        onChange={(_e, newValue) => {
          const nextValues = newValue.map(getTagOptionValue);
          const tags = filterTags(nextValues);
          if (
            tags &&
            tags.length <= maximumTags &&
            tags.length === nextValues.length
          ) {
            onChange(tags);
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            margin="normal"
            label={label ?? t('tagsInput.label')}
            placeholder={t('tagsInput.placeholder')}
            helperText={error ? error.message : getHelperText()}
            FormHelperTextProps={{
              style: { marginLeft: '0.2em' },
            }}
            name={name}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            error={error !== undefined}
          />
        )}
      />
      {suggestedTags?.length > 0 && (
        <Box style={{ marginLeft: '4px' }}>
          <Typography variant="caption" color="textSecondary">
            {t('tagsInput.suggestedTags')}
          </Typography>
          <Box mt={0.5}>
            {suggestedTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onClick={() => handleSuggestedTagClick(tag)}
                style={{ margin: '0 4px 4px 0' }}
                disabled={
                  value?.includes(tag) ||
                  (value?.length ?? 0) >= maximumTags ||
                  loadingSuggestions
                }
              />
            ))}
          </Box>
        </Box>
      )}{' '}
    </Box>
  );
});

TagInput.displayName = 'TagInput';
