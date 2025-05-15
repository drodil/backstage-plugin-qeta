import { Autocomplete } from '@material-ui/lab';
import { getEntityTitle } from '../../utils/utils';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { TextField, Tooltip, Typography } from '@material-ui/core';
import {
  ComponentType,
  CSSProperties,
  HTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  style?: CSSProperties;
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
  const [availableEntities, setAvailableEntities] = useState<Entity[] | null>(
    [],
  );
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
        catalogApi
          .getEntitiesByRefs({ entityRefs: refs })
          .catch(_ => setAvailableEntities(null))
          .then(catalogData => {
            setLoading(false);
            setAvailableEntities(
              catalogData ? compact(catalogData.items) : null,
            );
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
        .then(data => {
          setLoading(false);
          setAvailableEntities(data ? data.items : null);
        });
    }
  }, [
    catalogApi,
    singleValue,
    configApi,
    entityKinds,
    useOnlyUsedEntities,
    qetaApi,
  ]);

  if (!availableEntities) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      autoHighlight
      autoComplete
      className="qetaEntitiesInput"
      value={value}
      disabled={disabled}
      loading={loading}
      loadingText={t('common.loading')}
      groupBy={entityKinds.length > 1 ? option => option.kind : undefined}
      renderGroup={renderGroup}
      id="entities-select"
      handleHomeEndKeys
      options={availableEntities}
      getOptionLabel={getEntityTitle}
      ListboxComponent={
        AutocompleteListboxComponent as ComponentType<
          HTMLAttributes<HTMLElement>
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
                  <Typography>{getEntityTitle(option)}</Typography>
                  <Typography variant="caption">
                    {stringifyEntityRef(option)}
                  </Typography>
                  <Typography variant="caption">
                    {option.metadata.description}
                  </Typography>
                </>
              }
            >
              <span>{getEntityTitle(option, { withType: false })}</span>
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
