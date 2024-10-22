import { Grid, IconButton, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { useQetaApi, useTranslation } from '../../utils/hooks';
import { Progress, WarningPanel } from '@backstage/core-components';
import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { UsersGridItem } from './UsersGridItem';

export const UsersGrid = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useTranslation();

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getUsers(), []);

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('usersPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const filterData = (query: string, data: UserResponse[]) => {
    if (!query) {
      return data;
    }
    return data.filter(entity => entity.userRef.toLowerCase().includes(query));
  };

  const entities = filterData(searchQuery, response);

  return (
    <Grid container className="qetaUsersContainer">
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text qetaUsersContainerSearchInput"
          onChange={(
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => setSearchQuery(event.target.value)}
          label={t('usersPage.search.label')}
          variant="outlined"
          placeholder={t('usersPage.search.placeholder')}
          size="small"
        />
        <IconButton type="submit" aria-label="search" />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" className="qetaUsersContainerTitle">
          {t('usersPage.users', { count: entities.length })}
        </Typography>
      </Grid>
      <Grid container item xs={12} alignItems="stretch">
        {entities.map(entity => (
          <UsersGridItem user={entity} key={entity.userRef} />
        ))}
      </Grid>
    </Grid>
  );
};
