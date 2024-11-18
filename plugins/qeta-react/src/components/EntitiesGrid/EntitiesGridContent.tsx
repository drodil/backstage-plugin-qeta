import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { EntitiesResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { EntitiesGridItem } from './EntitiesGridItem';
import { NoEntitiesCard } from './NoEntitiesCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';

export const EntitiesGridContent = (props: {
  loading: boolean;
  error: any;
  response?: EntitiesResponse;
}) => {
  const { response, loading, error } = props;
  const { t } = useTranslation();
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading) {
    if (initialLoad) {
      return <LoadingGrid />;
    }
    return null;
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
    <>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaEntitiesContainerTitle">
          {t('entitiesPage.entities', { count: response.total })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {response?.entities.map(entity => (
          <EntitiesGridItem entity={entity} key={entity.entityRef} />
        ))}
      </Grid>
    </>
  );
};
