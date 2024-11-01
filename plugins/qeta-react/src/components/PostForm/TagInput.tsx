import { Autocomplete } from '@material-ui/lab';
import { TextField, Tooltip } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { qetaApiRef } from '../../api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../hooks';
import { FieldError } from 'react-hook-form';

export const TagInput = (props: {
  value?: string[];
  onChange: (value: string[]) => void;
  error?: FieldError;
  allowCreate?: boolean;
  hideHelpText?: boolean;
  style?: React.CSSProperties;
}) => {
  const {
    value,
    onChange,
    error,
    allowCreate = true,
    hideHelpText = false,
    style,
  } = props;
  const qetaApi = useApi(qetaApiRef);
  const config = useApi(configApiRef);
  const { t } = useTranslation();
  const allowCreation = useMemo(
    () => config.getOptionalBoolean('qeta.tags.allowCreation') ?? allowCreate,
    [config, allowCreate],
  );
  const allowedTags = useMemo(
    () => config.getOptionalStringArray('qeta.tags.allowedTags') ?? null,
    [config],
  );
  const maximumTags = useMemo(
    () => config.getOptionalNumber('qeta.tags.max') ?? 5,
    [config],
  );
  const [availableTags, setAvailableTags] = React.useState<string[] | null>([]);
  const [tagDescriptions, setTagDescriptions] = React.useState<
    Record<string, string>
  >({});
  useEffect(() => {
    qetaApi
      .getTags()
      .catch(_ => setAvailableTags(null))
      .then(data => {
        if (data) {
          const uniqueTags = [
            ...new Set([
              ...(allowedTags ?? []),
              ...data.tags.map(tag => tag.tag),
            ]),
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
        }
      });
  }, [qetaApi, allowCreation, allowedTags]);

  if (!availableTags || availableTags.length === 0) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      id="tags-select"
      className="qetaTagInput"
      value={value}
      options={availableTags ?? []}
      freeSolo={allowCreation}
      style={style}
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
