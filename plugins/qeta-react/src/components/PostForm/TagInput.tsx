import { Autocomplete } from '@material-ui/lab';
import { TextField, Tooltip, Typography } from '@material-ui/core';
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
import { useTranslation } from '../../hooks';
import { FieldError } from 'react-hook-form';
import { AutocompleteListboxComponent } from './AutocompleteListComponent';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

export const TagInput = (props: {
  value?: string[];
  onChange: (value: string[]) => void;
  error?: FieldError;
  allowCreate?: boolean;
  hideHelpText?: boolean;
  style?: CSSProperties;
}) => {
  const {
    value,
    onChange,
    error,
    allowCreate,
    hideHelpText = false,
    style,
  } = props;
  const qetaApi = useApi(qetaApiRef);
  const config = useApi(configApiRef);
  const permissions = useApi(permissionApiRef);
  const { t } = useTranslation();
  const [allowCreation, setAllowCreation] = useState<boolean | undefined>(
    allowCreate,
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (allowCreate !== undefined) {
      return;
    }

    if (config.getOptionalBoolean('qeta.permissions') === true) {
      permissions
        .authorize({
          permission: qetaCreateTagPermission,
        })
        .then(res => {
          if (res.result === AuthorizeResult.ALLOW) {
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
        ];
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

  return (
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
            <Tooltip
              arrow
              placement="right"
              title={<Typography>{tagDescriptions[option]}</Typography>}
            >
              <span>{option}</span>
            </Tooltip>
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
          onChange(newValue);
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          margin="normal"
          label={t('tagsInput.label')}
          placeholder={t('tagsInput.placeholder')}
          helperText={
            hideHelpText
              ? ''
              : t('tagsInput.helperText', {
                  max: maximumTags.toString(10),
                })
          }
          error={error !== undefined}
        />
      )}
    />
  );
};
