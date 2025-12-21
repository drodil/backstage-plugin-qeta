import { CollectionsResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { CollectionsGridItem } from './CollectionsGridItem';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { NoCollectionsCard } from './NoCollectionsCard';

export const CollectionsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: CollectionsResponse;
}) => {
  const { loading, error, response } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  if (loading) {
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
      <Grid container item direction="row" alignItems="stretch">
        {response.collections.map(p => {
          return (
            <Grid item xs={12} md={12} lg={6} key={p.id}>
              <CollectionsGridItem collection={p} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
