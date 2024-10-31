import { Grid, Typography } from '@material-ui/core';
import { TagGridItem } from './TagGridItem';
import React, { useEffect, useState } from 'react';
import { TagsResponse } from '@drodil/backstage-plugin-qeta-common';
import { WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';
import { NoTagsCard } from './NoTagsCard';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';

export const TagsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: TagsResponse;
  onTagEdit: () => void;
}) => {
  const { response, onTagEdit, loading, error } = props;
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
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (!response?.tags || response.tags.length === 0) {
    return <NoTagsCard />;
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaTagsContainerTitle">
          {t('tagPage.tags', { count: response.total })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {response?.tags.map(tag => (
          <TagGridItem tag={tag} key={tag.tag} onTagEdit={onTagEdit} />
        ))}
      </Grid>
    </>
  );
};
