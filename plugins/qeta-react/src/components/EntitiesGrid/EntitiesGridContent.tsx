import React from 'react';
import { EntitiesResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { EntitiesGridItem } from './EntitiesGridItem';
import { NoEntitiesCard } from './NoEntitiesCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { Grid } from '@material-ui/core';

export const EntitiesGridContent = (props: {
  loading: boolean;
  error: any;
  response?: EntitiesResponse;
}) => {
  const { response, loading, error } = props;
  const { t } = useTranslation();

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('entitiesPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.entities || response.entities.length === 0) {
    return <NoEntitiesCard />;
  }

  return (
    <Grid container item xs={12} alignItems="stretch">
      {response?.entities.map(entity => (
        <EntitiesGridItem entity={entity} key={entity.entityRef} />
      ))}
    </Grid>
  );
};
