import { CollectionsResponse } from '@drodil/backstage-plugin-qeta-common';
import React, { useEffect, useState } from 'react';
import { WarningPanel } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { CollectionsGridItem } from './CollectionsGridItem';
import { useTranslation } from '../../hooks';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { NoCollectionsCard } from './NoCollectionsCard';

export const CollectionsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: CollectionsResponse;
}) => {
  const { loading, error, response } = props;
  const [initialLoad, setInitialLoad] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading && initialLoad) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel
        severity="error"
        title={t('postsList.errorLoading', { itemType: 'collections' })}
      >
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response.collections || response.collections.length === 0) {
    return <NoCollectionsCard />;
  }

  return (
    <>
      <Grid
        container
        item
        direction="row"
        alignItems="stretch"
        style={{ marginTop: '1rem' }}
      >
        {response.collections.map(p => {
          return (
            <Grid item xs={12} md={4} lg={3} key={p.id}>
              <CollectionsGridItem collection={p} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
