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
  HTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { qetaApiRef } from '../../api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  filterTags,
  qetaCreateTagPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { FieldError } from 'react-hook-form';
import { AutocompleteListboxComponent } from './AutocompleteListComponent';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { useDebounce } from 'react-use';

export const TagInput = (props: {
  value?: string[];
  onChange: (value: string[]) => void;
  error?: FieldError;
  allowCreate?: boolean;
  hideHelpText?: boolean;
  style?: CSSProperties;
  title?: string;
  name?: string;
  content?: string;
}) => {
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
  const [, setLoadingSuggestions] = useState(false);

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
          .getTagSuggestions({ title, content })
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
    [title, content, qetaApi],
  );

  const allowedTags = useMemo(
    () => config.getOptionalStringArray('qeta.tags.allowedTags') ?? [],
    [config],
  );
  const maximumTags = useMemo(
    () => config.getOptionalNumber('qeta.tags.max') ?? 5,
    [config],
  );

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagDescriptions, setTagDescriptions] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    qetaApi
      .getTags()
      .catch(_ => setAvailableTags([]))
      .then(data => {
        setLoading(false);
        if (!data) {
          return;
        }

        const uniqueTags = [
          ...new Set([...allowedTags, ...data.tags.map(tag => tag.tag)]),
        ].sort((a, b) => a.localeCompare(b));
        setAvailableTags(uniqueTags);
        setTagDescriptions(
          data.tags.reduce((acc, tag) => {
            if (!tag.description) {
              return acc;
            }
            acc[tag.tag] = tag.description;
            return acc;
          }, {} as Record<string, string>),
        );
      });
  }, [qetaApi, allowCreation, allowedTags]);

  if (!allowCreation && availableTags.length === 0) {
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
        value={value}
        loading={loading}
        autoHighlight
        autoComplete
        loadingText={t('common.loading')}
        options={availableTags ?? []}
        freeSolo={allowCreation}
        handleHomeEndKeys
        ListboxComponent={
          AutocompleteListboxComponent as ComponentType<
            HTMLAttributes<HTMLElement>
          >
        }
        disableListWrap
        style={style}
        renderOption={option => {
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
          const tags = filterTags(newValue);
          if (
            tags &&
            tags.length <= maximumTags &&
            tags.length === newValue.length
          ) {
            onChange(tags);
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            margin="normal"
            label={t('tagsInput.label')}
            placeholder={t('tagsInput.placeholder')}
            helperText={error !== undefined ? error.message : getHelperText()}
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
                  value?.includes(tag) || (value?.length ?? 0) >= maximumTags
                }
              />
            ))}
          </Box>
        </Box>
      )}{' '}
    </Box>
  );
};
