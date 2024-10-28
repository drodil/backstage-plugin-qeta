import { Grid, Typography } from '@material-ui/core';
import { TagGridItem } from './TagGridItem';
import React, { useEffect, useState } from 'react';
import { TagsResponse } from '@drodil/backstage-plugin-qeta-common';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useTranslation } from '../../hooks';

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
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  if (loading && initialLoad) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
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
