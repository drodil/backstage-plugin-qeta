import { Control, Controller } from 'react-hook-form';
import { TagAndEntitiesFormValues } from './types';
import { Autocomplete } from '@material-ui/lab';
import { getEntityTitle } from '../../utils/utils';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { TextField, Tooltip } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useTranslation } from '../../hooks';

export const EntitiesInput = (props: {
  control: Control<TagAndEntitiesFormValues>;
  entityRef?: string;
}) => {
  const { control, entityRef } = props;
  const configApi = useApi(configApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [availableEntities, setAvailableEntities] = React.useState<
    Entity[] | null
  >([]);
  const { t } = useTranslation();

  const entityKinds: string[] = useMemo(() => {
    let kinds = configApi.getOptionalStringArray('qeta.entityKinds');
    if (!kinds) {
      kinds = configApi.getOptionalStringArray('qeta.entities.kinds');
    }
    return kinds || ['Component', 'System'];
  }, [configApi]);
  const max = useMemo(
    () => configApi.getOptionalNumber('qeta.entities.max') ?? 3,
    [configApi],
  );

  useEffect(() => {
    if (entityRef) {
      catalogApi.getEntityByRef(entityRef).then(data => {
        if (data) {
          setAvailableEntities([data]);
        }
      });
    }
  }, [catalogApi, entityRef]);

  useEffect(() => {
    if (entityRef) {
      return;
    }

    if (entityKinds && entityKinds.length > 0) {
      catalogApi
        .getEntities({
          order: { field: 'kind', order: 'asc' },
          filter: { kind: entityKinds },
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'metadata.title',
          ],
        })
        .catch(_ => setAvailableEntities(null))
        .then(data =>
          data ? setAvailableEntities(data.items) : setAvailableEntities(null),
        );
    }
  }, [catalogApi, entityRef, configApi, entityKinds]);

  if (!availableEntities || availableEntities.length === 0) {
    return null;
  }

  return (
    <Controller
      control={control}
      render={({ field: { onChange, value } }) => (
        <Autocomplete
          multiple
          className="qetaAskFormEntities"
          value={value}
          groupBy={entityKinds.length > 1 ? option => option.kind : undefined}
          id="entities-select"
          options={availableEntities}
          getOptionLabel={getEntityTitle}
          getOptionSelected={(o, v) =>
            stringifyEntityRef(o) === stringifyEntityRef(v)
          }
          onChange={(_e, newValue) => {
            if (!value || value.length < max) {
              onChange(newValue);
            }
          }}
          renderOption={option => {
            return (
              <>
                <Tooltip title={stringifyEntityRef(option)}>
                  <span>{getEntityTitle(option)}</span>
                </Tooltip>
              </>
            );
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              margin="normal"
              label={t('entitiesInput.label')}
              placeholder={t('entitiesInput.placeholder')}
              helperText={t('entitiesInput.helperText', {
                max: max.toString(10),
              })}
            />
          )}
        />
      )}
      name="entities"
    />
  );
};
