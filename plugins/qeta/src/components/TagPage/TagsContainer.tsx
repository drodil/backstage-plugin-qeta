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
import { Skeleton } from '@material-ui/lab';
import { WarningPanel } from '@backstage/core-components';
import { TagResponse } from '../../api';

export const TagsContainer = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => api.getTags(), []);

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
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
    <Grid container>
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text"
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
        <Typography variant="h6">{`Showing ${tags.length} tags`}</Typography>
      </Grid>
      <Grid item>
        {tags.map(tag => (
          <Chip
            key={tag.tag}
            variant="outlined"
            avatar={<Avatar>{tag.questionsCount}</Avatar>}
            label={tag.tag}
            component="a"
            clickable
            href={`/qeta/tags/${tag.tag}`}
          />
        ))}
      </Grid>
    </Grid>
  );
};
