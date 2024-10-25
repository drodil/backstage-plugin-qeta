import { Grid, IconButton, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Progress, WarningPanel } from '@backstage/core-components';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { TagGridItem } from './TagGridItem';
import { useQetaApi, useTranslation } from '../../hooks';

export const TagsGrid = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useTranslation();

  const {
    value: response,
    loading,
    error,
    retry,
  } = useQetaApi(api => api.getTags(), []);

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('tagPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const filterData = (query: string, data: TagResponse[]) => {
    if (!query) {
      return data;
    }
    return data.filter(
      tag =>
        tag.tag.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query),
    );
  };

  const onTagEdit = () => {
    retry();
  };

  const tags = filterData(searchQuery, response);

  return (
    <Grid container className="qetaTagsContainer">
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text qetaTagsContainerSearchInput"
          onChange={(
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => setSearchQuery(event.target.value)}
          label={t('tagPage.search.label')}
          variant="outlined"
          placeholder={t('tagPage.search.placeholder')}
          size="small"
        />
        <IconButton type="submit" aria-label="search" />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaTagsContainerTitle">
          {t('tagPage.tags', { count: tags.length })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {tags.map(tag => (
          <TagGridItem tag={tag} key={tag.tag} onTagEdit={onTagEdit} />
        ))}
      </Grid>
    </Grid>
  );
};
