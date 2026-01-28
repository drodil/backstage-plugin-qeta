import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Button } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { useIsModerator } from '../../hooks/useIsModerator';
import { CommonFilterPanelProps, TagFilters } from '../FilterPanel/FilterPanel';
import { TagGridItem } from './TagGridItem';
import { TagListItem } from './TagListItem';
import {
  qetaCreateTagPermission,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { OptionalRequirePermission } from '../Utility/OptionalRequirePermission';
import { CreateTagModal } from './CreateTagModal';
import { QetaEntityContainer } from '../QetaEntityContainer/QetaEntityContainer';
import { ViewType } from '../ViewToggle/ViewToggle';

export const TagsContainer = (props: {
  filterPanelProps?: CommonFilterPanelProps;
  defaultView?: ViewType;
}) => {
  const { filterPanelProps, defaultView } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { isModerator } = useIsModerator();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const handleCreateModalOpen = () => setCreateModalOpen(true);

  const handleCreateModalCloseWithRetry = (retry: () => void) => {
    setCreateModalOpen(false);
    retry();
  };

  return (
    <QetaEntityContainer<TagResponse, TagFilters>
      prefix="tags"
      defaultPageSize={24}
      defaultView={defaultView}
      initialFilters={{
        order: 'desc',
        orderBy: 'postsCount',
        searchQuery: '',
      }}
      fetch={(api, limit, offset, filters) => {
        return api
          .getTags({
            limit,
            offset,
            searchQuery: filters.searchQuery,
            order: filters.order,
            orderBy: filters.orderBy,
            checkAccess: true,
          })
          .then(res => ({ items: res.tags, total: res.total }));
      }}
      filterPanelProps={{
        ...filterPanelProps,
        mode: 'tags',
      }}
      renderListItem={(tag, { retry }) => (
        <TagListItem tag={tag} onTagEdit={retry} isModerator={isModerator} />
      )}
      renderGridItem={(tag, { retry }) => (
        <TagGridItem tag={tag} onTagEdit={retry} isModerator={isModerator} />
      )}
      title={total => t('tagPage.tags', { count: total })}
      searchPlaceholder={t('tagPage.search.label')}
      emptyMessage={t('tagPage.tags', { count: 0 })}
      getKey={tag => tag.tag}
      headerButtons={({ retry }) => (
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
              onClose={() => handleCreateModalCloseWithRetry(retry)}
              isModerator={isModerator}
            />
          </OptionalRequirePermission>
        </>
      )}
    />
  );
};
