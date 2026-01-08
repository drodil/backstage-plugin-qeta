import { Autocomplete } from '@material-ui/lab';
import { getEntityDescription, getEntityTitle } from '../../utils/utils';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
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
  useCallback,
  useMemo,
  useState,
} from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { qetaApiRef } from '../../api';
import { compact } from 'lodash';
import {
  AutocompleteListboxComponent,
  renderGroup,
} from './AutocompleteListComponent';
import { AutocompleteProps } from '@material-ui/lab/Autocomplete/Autocomplete';
import { FieldError } from 'react-hook-form';
import { getSupportedEntityKinds } from '@drodil/backstage-plugin-qeta-common';
import { useDebounce } from 'react-use';

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
  autocompleteProps?: AutocompleteProps<any, any, any, any>;
  onChange: (value: any) => void;
  title?: string;
  content?: string;
  tags?: string[];
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
      autocompleteProps,
      title,
      content,
      tags,
    } = props;

    const configApi = useApi(configApiRef);
    const catalogApi = useApi(catalogApiRef);
    const qetaApi = useApi(qetaApiRef);
    const [availableEntities, setAvailableEntities] = useState<Entity[] | null>(
      [],
    );
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { t } = useTranslationRef(qetaTranslationRef);
    const [suggestedEntities, setSuggestedEntities] = useState<Entity[]>([]);
    const [, setLoadingSuggestions] = useState(false);

    const entityKinds: string[] = useMemo(() => {
      if (kind) {
        return kind;
      }
      return getSupportedEntityKinds(configApi);
    }, [configApi, kind]);
    const max = useMemo(() => {
      if (maximum) {
        return maximum;
      }
      return configApi.getOptionalNumber('qeta.entities.max') ?? 3;
    }, [configApi, maximum]);

    const handleOpen = useCallback(() => {
      setOpen(true);
      (async () => {
        setLoading(true);
        if (singleValue) {
          const entity = await catalogApi.getEntityByRef(singleValue);
          setLoading(false);
          setAvailableEntities(entity ? [entity] : null);
          return;
        }

        if (useOnlyUsedEntities) {
          const qetaEntities = await qetaApi.getEntities();
          const refs = qetaEntities.entities.map(r => r.entityRef);
          const catalogData = await catalogApi.getEntitiesByRefs({
            entityRefs: refs,
            fields: CATALOG_FIELDS,
          });
          setLoading(false);
          setAvailableEntities(
            catalogData
              ? compact(catalogData.items).sort((a, b) =>
                  getEntityTitle(a).localeCompare(getEntityTitle(b)),
                )
              : null,
          );
          return;
        }

        if (entityKinds && entityKinds.length > 0) {
          const entities = await catalogApi.getEntities({
            filter: { kind: entityKinds },
            fields: CATALOG_FIELDS,
            order: [
              { field: 'kind', order: 'asc' },
              { field: 'metadata.title', order: 'asc' },
            ],
          });
          setLoading(false);
          setAvailableEntities(entities ? entities.items : null);
          return;
        }
        setLoading(false);
        setAvailableEntities(null);
      })();
    }, [singleValue, useOnlyUsedEntities, entityKinds, catalogApi, qetaApi]);

    const usedValue = useMemo(() => {
      if (!value) {
        return multiple ? [] : null;
      }
      return value;
    }, [value, multiple]);

    useDebounce(
      () => {
        if (title && content) {
          setLoadingSuggestions(true);
          qetaApi
            .getEntitySuggestions({
              title,
              content,
              tags,
              entities: [value ?? []].flat().map(stringifyEntityRef),
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
      [title, content, qetaApi],
    );

    const handleSuggestedEntityClick = (entity: Entity) => {
      const values = [value ?? []].flat();
      if (values && values.length < max && !values.includes(entity)) {
        onChange([...values, entity]);
      }
    };

    if (!availableEntities) {
      return null;
    }

    return (
      <Box>
        <Autocomplete
          multiple={multiple}
          autoHighlight
          autoComplete
          className="qetaEntitiesInput"
          value={usedValue}
          disabled={disabled}
          loading={loading}
          loadingText={t('common.loading')}
          groupBy={entityKinds.length > 1 ? option => option.kind : undefined}
          renderGroup={renderGroup}
          handleHomeEndKeys
          open={open}
          onOpen={handleOpen}
          onClose={() => setOpen(false)}
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
            if (multiple) {
              if (!newValue) {
                onChange([]);
                return;
              }
              const val = Array.isArray(newValue) ? newValue : [newValue];
              if (max === null || val.length <= max) {
                onChange(val.filter(v => typeof v !== 'string'));
              }
            } else {
              if (!newValue) {
                return;
              }
              onChange(newValue as Entity);
            }
          }}
          renderOption={(option: Entity) => {
            const stringified = stringifyEntityRef(option);
            return (
              <span key={stringified}>
                <Tooltip
                  arrow
                  placement="right"
                  title={
                    <>
                      <Typography>{getEntityTitle(option)}</Typography>
                      <Typography variant="caption">
                        {getEntityDescription(option)}
                      </Typography>
                    </>
                  }
                >
                  <span>{getEntityTitle(option, { withType: false })}</span>
                </Tooltip>
              </span>
            );
          }}
          renderInput={params => {
            let helperText = '';
            if (!hideHelpText) {
              if (error && error.message) {
                helperText = error.message;
              } else {
                helperText = t('entitiesInput.helperText', {
                  max: max.toString(),
                });
              }
            }

            return (
              <TextField
                {...params}
                variant="outlined"
                margin="normal"
                required={required}
                label={label || t('entitiesInput.label')}
                placeholder={placeholder || t('entitiesInput.placeholder')}
                helperText={helperText}
                name={name}
                FormHelperTextProps={{
                  style: { marginLeft: '0.2em' },
                }}
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
            );
          }}
          {...autocompleteProps}
        />
        {suggestedEntities?.length > 0 && (
          <Box style={{ marginLeft: '4px' }}>
            <Typography variant="caption" color="textSecondary">
              {t('entitiesInput.suggestedEntities')}
            </Typography>
            <Box mt={0.5}>
              {suggestedEntities.map(entity => (
                <Chip
                  key={stringifyEntityRef(entity)}
                  label={getEntityTitle(entity)}
                  size="small"
                  onClick={() => handleSuggestedEntityClick(entity)}
                  style={{ margin: '0 4px 4px 0' }}
                  disabled={
                    [value ?? []]
                      .flat()
                      .map(stringifyEntityRef)
                      .includes(stringifyEntityRef(entity)) ||
                    [value ?? []].flat().length >= max
                  }
                />
              ))}
            </Box>
          </Box>
        )}{' '}
      </Box>
    );
  },
);

EntitiesInput.displayName = 'EntitiesInput';
