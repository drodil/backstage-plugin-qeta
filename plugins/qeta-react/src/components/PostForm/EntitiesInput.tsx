import { Autocomplete } from '@material-ui/lab';
import { getEntityTitle } from '../../utils/utils';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { TextField, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useTranslation } from '../../hooks';
import { qetaApiRef } from '../../api';
import { compact } from 'lodash';
import {
  AutocompleteListboxComponent,
  renderGroup,
} from './AutocompleteListComponent';

export const EntitiesInput = (props: {
  value?: Entity[];
  singleValue?: string;
  onChange: (value: Entity[]) => void;
  useOnlyUsedEntities?: boolean;
  hideHelpText?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}) => {
  const {
    value,
    singleValue,
    onChange,
    useOnlyUsedEntities = false,
    hideHelpText = false,
    style,
    disabled,
  } = props;
  const configApi = useApi(configApiRef);
  const catalogApi = useApi(catalogApiRef);
  const qetaApi = useApi(qetaApiRef);
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
    if (singleValue) {
      catalogApi.getEntityByRef(singleValue).then(data => {
        if (data) {
          setAvailableEntities([data]);
        }
      });
    }
  }, [catalogApi, singleValue]);

  useEffect(() => {
    if (singleValue) {
      return;
    }

    if (useOnlyUsedEntities) {
      qetaApi.getEntities().then(data => {
        const refs = data.entities.map(r => r.entityRef);
        catalogApi.getEntitiesByRefs({ entityRefs: refs }).then(catalogData => {
          setAvailableEntities(compact(catalogData.items));
        });
      });
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
            'metadata.description',
            'spec.type',
          ],
        })
        .catch(_ => setAvailableEntities(null))
        .then(data =>
          data ? setAvailableEntities(data.items) : setAvailableEntities(null),
        );
    }
  }, [
    catalogApi,
    singleValue,
    configApi,
    entityKinds,
    useOnlyUsedEntities,
    qetaApi,
  ]);

  if (!availableEntities || availableEntities.length === 0) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      className="qetaEntitiesInput"
      value={value}
      disabled={disabled}
      groupBy={entityKinds.length > 1 ? option => option.kind : undefined}
      renderGroup={renderGroup}
      id="entities-select"
      options={availableEntities}
      getOptionLabel={getEntityTitle}
      ListboxComponent={
        AutocompleteListboxComponent as React.ComponentType<
          React.HTMLAttributes<HTMLElement>
        >
      }
      disableListWrap
      style={style}
      getOptionSelected={(o, v) =>
        stringifyEntityRef(o) === stringifyEntityRef(v)
      }
      onChange={(_e, newValue) => {
        if (!newValue || newValue.length <= max) {
          onChange(newValue);
        }
      }}
      renderOption={option => {
        return (
          <>
            <Tooltip
              arrow
              placement="right"
              title={
                <>
                  <Typography>{stringifyEntityRef(option)}</Typography>
                  <Typography variant="caption">
                    {option.metadata.description}
                  </Typography>
                </>
              }
            >
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
          helperText={
            hideHelpText
              ? ''
              : t('entitiesInput.helperText', {
                  max: max.toString(10),
                })
          }
        />
      )}
    />
  );
};
