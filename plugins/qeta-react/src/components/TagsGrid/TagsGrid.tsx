import { Grid, IconButton, TextField } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useQetaApi, useTranslation } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import useDebounce from 'react-use/lib/useDebounce';
import { TagsGridContent } from './TagsGridContent';

type TagFilters = {
  order: 'asc' | 'desc';
  orderBy: 'tag' | 'followersCount' | 'postsCount';
  searchQuery: string;
};

export const TagsGrid = () => {
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [tagsPerPage, setTagsPerPage] = React.useState(25);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<TagFilters>({
    order: 'desc',
    orderBy: 'tag',
    searchQuery: '',
  });

  const onSearchQueryChange = (val: string) => {
    setPage(1);
    setSearchQuery(val);
  };

  const {
    value: response,
    loading,
    error,
    retry,
  } = useQetaApi(
    api =>
      api.getTags({
        limit: tagsPerPage,
        offset: (page - 1) * tagsPerPage,
        ...filters,
      }),
    [page, tagsPerPage, filters],
  );

  useDebounce(
    () => {
      if (filters.searchQuery !== searchQuery) {
        setFilters({ ...filters, searchQuery: searchQuery });
      }
    },
    400,
    [searchQuery],
  );

  useEffect(() => {
    if (response) {
      setPageCount(Math.ceil(response.total / tagsPerPage));
    }
  }, [response, tagsPerPage]);

  const onTagEdit = () => {
    retry();
  };

  return (
    <Grid container className="qetaTagsContainer">
      <Grid item xs={12}>
        <TextField
          id="search-bar"
          className="text qetaTagsContainerSearchInput"
          onChange={(
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
          ) => onSearchQueryChange(event.target.value)}
          value={searchQuery}
          label={t('tagPage.search.label')}
          variant="outlined"
          placeholder={t('tagPage.search.placeholder')}
          size="small"
        />
        <IconButton type="submit" aria-label="search" />
      </Grid>

      <TagsGridContent
        response={response}
        onTagEdit={onTagEdit}
        loading={loading}
        error={error}
      />
      {response && response?.total > 0 && (
        <QetaPagination
          pageSize={tagsPerPage}
          handlePageChange={(_e, p) => setPage(p)}
          handlePageSizeChange={e => setTagsPerPage(Number(e.target.value))}
          page={page}
          pageCount={pageCount}
        />
      )}
    </Grid>
  );
};
