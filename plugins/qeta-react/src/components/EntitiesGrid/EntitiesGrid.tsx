import { Grid, IconButton, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { useQetaApi, useTranslation } from '../../utils/hooks';
import { Progress, WarningPanel } from '@backstage/core-components';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntitiesGridItem } from './EntitiesGridItem';

export const EntitiesGrid = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useTranslation();

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getEntities(), []);

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('entitiesPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const filterData = (query: string, data: EntityResponse[]) => {
    if (!query) {
      return data;
    }
    return data.filter(entity =>
      entity.entityRef.toLowerCase().includes(query),
    );
  };

  const entities = filterData(searchQuery, response);

  return (
    <Grid container className="qetaEntitiesContainer">
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text qetaEntitiesContainerSearchInput"
          onChange={(
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => setSearchQuery(event.target.value)}
          label={t('entitiesPage.search.label')}
          variant="outlined"
          placeholder={t('entitiesPage.search.placeholder')}
          size="small"
        />
        <IconButton type="submit" aria-label="search" />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaEntitiesContainerTitle">
          {t('entitiesPage.entities', { count: entities.length })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {entities.map(entity => (
          <EntitiesGridItem entity={entity} key={entity.entityRef} />
        ))}
      </Grid>
    </Grid>
  );
};
