import { Grid, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { EntitiesResponse } from '@drodil/backstage-plugin-qeta-common';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { EntitiesGridItem } from './EntitiesGridItem';

export const EntitiesGridContent = (props: {
  loading: boolean;
  error: any;
  response?: EntitiesResponse;
}) => {
  const { response, loading, error } = props;
  const { t } = useTranslation();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading && initialLoad) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('entitiesPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
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
