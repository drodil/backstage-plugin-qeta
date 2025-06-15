import { useEffect, useState } from 'react';
import { useIsModerator, useQetaApi } from '../../hooks';
import { QetaPagination } from '../QetaPagination/QetaPagination';
import useDebounce from 'react-use/lib/useDebounce';
import { TagsGridContent } from './TagsGridContent';
import { SearchBar } from '../SearchBar/SearchBar';
import { Button, Grid, Typography } from '@material-ui/core';
import { CreateTagModal } from './CreateTagModal';
import { qetaCreateTagPermission } from '@drodil/backstage-plugin-qeta-common';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

type TagFilters = {
  order: 'asc' | 'desc';
  orderBy: 'tag' | 'followersCount' | 'postsCount';
  searchQuery: string;
};

export const TagsGrid = () => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [tagsPerPage, setTagsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslationRef(qetaTranslationRef);
  const { isModerator } = useIsModerator();
  const [filters, setFilters] = useState<TagFilters>({
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
        checkAccess: true,
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

  const onTagsModify = () => {
    retry();
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const handleCreateModalOpen = () => setCreateModalOpen(true);
  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    onTagsModify();
  };

  return (
    <>
      <Grid container className="qetaTagsContainer">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearchQueryChange}
            label={t('tagPage.search.label')}
            loading={loading}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between">
        {response && (
          <Grid item xs={8}>
            <Typography variant="h6" className="qetaTagsContainerTitle">
              {t('tagPage.tags', { count: response.total })}
            </Typography>
          </Grid>
        )}
        {response && (
          <Grid item xs={4}>
            <OptionalRequirePermission
              permission={qetaCreateTagPermission}
              errorPage={<></>}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateModalOpen}
                style={{ float: 'right' }}
              >
                {t('tagPage.createTag')}
              </Button>
              <CreateTagModal
                open={createModalOpen}
                onClose={handleCreateModalClose}
                isModerator={isModerator}
              />
            </OptionalRequirePermission>
          </Grid>
        )}
        <TagsGridContent
          response={response}
          onTagEdit={onTagsModify}
          loading={loading}
          error={error}
          isModerator={isModerator}
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
    </>
  );
};
