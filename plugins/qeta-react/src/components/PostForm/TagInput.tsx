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
}) => {
  const { value, onChange, error } = props;
  const qetaApi = useApi(qetaApiRef);
  const config = useApi(configApiRef);
  const { t } = useTranslation();
  const allowCreation = useMemo(
    () => config.getOptionalBoolean('qeta.tags.allowCreation') ?? true,
    [config],
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
    if (allowCreation) {
      qetaApi
        .getTags()
        .catch(_ => setAvailableTags(null))
        .then(data => {
          if (data) {
            setAvailableTags(data.tags.map(tag => tag.tag));
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
    } else {
      setAvailableTags(allowedTags);
    }
  }, [qetaApi, allowCreation, allowedTags]);

  if (!allowCreation && (allowedTags === null || allowedTags.length === 0)) {
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
          helperText={t('tagsInput.helperText', {
            max: maximumTags.toString(10),
          })}
          error={error !== undefined}
        />
      )}
    />
  );
};
