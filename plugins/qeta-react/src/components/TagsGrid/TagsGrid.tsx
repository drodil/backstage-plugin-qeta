import { useEffect, useState } from 'react';
import { useGridPageSize, useIsModerator, useQetaApi } from '../../hooks';

import useDebounce from 'react-use/lib/useDebounce';
import { TagsGridContent } from './TagsGridContent';
import { Button } from '@material-ui/core';
import { CreateTagModal } from './CreateTagModal';
import { qetaCreateTagPermission } from '@drodil/backstage-plugin-qeta-common';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { QetaGridHeader } from '../Utility/QetaGridHeader';
import Add from '@material-ui/icons/Add';

import { Change, FilterPanel, TagFilters } from '../FilterPanel/FilterPanel';
import { Collapse } from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';

const EXPANDED_LOCAL_STORAGE_KEY = 'qeta-tags-filters-expanded';

export const TagsGrid = () => {
  const [page, setPage] = useState(1);
  const tagsPerPage = useGridPageSize('tags', 24);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslationRef(qetaTranslationRef);
  const { isModerator } = useIsModerator();
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem(EXPANDED_LOCAL_STORAGE_KEY) === 'true',
  );
  const [filters, setFilters] = useState<TagFilters>({
    order: 'desc',
    orderBy: 'postsCount',
    searchQuery: '',
  });
  const [tags, setTags] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      EXPANDED_LOCAL_STORAGE_KEY,
      showFilterPanel ? 'true' : 'false',
    );
  }, [showFilterPanel]);

  const onFilterChange = (
    changes: Change<TagFilters> | Change<TagFilters>[],
  ) => {
    const changesArray = Array.isArray(changes) ? changes : [changes];
    setPage(1);
    setTags([]);
    setFilters(prev => {
      const newValue = { ...prev };
      for (const { key, value } of changesArray) {
        (newValue as any)[key] = value;
      }
      return newValue;
    });
  };

  const onSearchQueryChange = (val: string) => {
    setPage(1);
    setTags([]);
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
      if (page === 1) {
        setTags(response.tags);
      } else {
        setTags(prev => [...prev, ...response.tags]);
      }
      setHasMore(response.tags.length >= tagsPerPage);
      setTotal(response.total);
    }
  }, [response, page, tagsPerPage]);

  const combinedResponse = response ? { ...response, tags, total } : undefined;

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
      <QetaGridHeader
        title={response ? t('tagPage.tags', { count: response.total }) : ''}
        searchBarLabel={t('tagPage.search.label')}
        loading={loading}
        onSearch={onSearchQueryChange}
        buttons={
          response && (
            <>
              <OptionalRequirePermission
                permission={qetaCreateTagPermission}
                errorPage={<></>}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Add />}
                  size="small"
                  onClick={handleCreateModalOpen}
                >
                  {t('tagPage.createTag')}
                </Button>
                <CreateTagModal
                  open={createModalOpen}
                  onClose={handleCreateModalClose}
                  isModerator={isModerator}
                />
              </OptionalRequirePermission>
              <Button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="qetaCollectionsContainerFilterPanelBtn"
                startIcon={<FilterList />}
                style={{ marginLeft: '1em' }}
              >
                {t('filterPanel.filterButton')}
              </Button>
            </>
          )
        }
      />
      <Collapse in={showFilterPanel}>
        <FilterPanel<TagFilters>
          onChange={onFilterChange}
          filters={filters}
          mode="tags"
        />
      </Collapse>
      <TagsGridContent
        response={combinedResponse}
        onTagEdit={onTagsModify}
        loading={loading}
        error={error}
        isModerator={isModerator}
        hasMore={hasMore}
        loadNextPage={() => setPage(prev => prev + 1)}
      />
    </>
  );
};
