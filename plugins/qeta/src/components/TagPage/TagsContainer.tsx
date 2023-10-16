import {
  Avatar,
  Chip,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useQetaApi } from '../../utils/hooks';
import { Progress, WarningPanel } from '@backstage/core-components';
import { TagResponse } from '../../api';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';

export const TagsContainer = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const tagRoute = useRouteRef(tagRouteRef);
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getTags(), []);

  if (loading) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load tags.">
        {error?.message}
      </WarningPanel>
    );
  }

  const filterData = (query: string, data: TagResponse[]) => {
    if (!query) {
      return data;
    }
    return data.filter(t => t.tag.toLowerCase().includes(query));
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
          label="Search tag"
          variant="outlined"
          placeholder="Search..."
          size="small"
        />
        <IconButton type="submit" aria-label="search" />
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          className="qetaTagsContainerTitle"
        >{`Showing ${tags.length} tags`}</Typography>
      </Grid>
      <Grid item>
        {tags.map(tag => (
          <Chip
            key={tag.tag}
            variant="outlined"
            avatar={<Avatar>{tag.questionsCount}</Avatar>}
            label={tag.tag}
            className="qetaTagsContainerChip"
            component="a"
            clickable
            href={tagRoute({ tag: tag.tag })}
          />
        ))}
      </Grid>
    </Grid>
  );
};
