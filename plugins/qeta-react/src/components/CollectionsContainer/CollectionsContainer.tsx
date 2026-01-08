import { CollectionResponse } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { CommonFilterPanelProps } from '../FilterPanel/FilterPanel';
import { CollectionsGridItem } from './CollectionsGridItem';
import { CollectionListItem } from './CollectionListItem';
import { QetaEntityContainer } from '../QetaEntityContainer/QetaEntityContainer';
import { ViewType } from '../ViewToggle/ViewToggle';

export const CollectionsContainer = (props: {
  filterPanelProps?: CommonFilterPanelProps;
  defaultView?: ViewType;
  owner?: string;
}) => {
  const { filterPanelProps, defaultView, owner } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <QetaEntityContainer<CollectionResponse, any>
      prefix="collections"
      defaultPageSize={24}
      defaultView={defaultView}
      initialFilters={{
        order: 'desc',
        searchQuery: '',
        orderBy: 'created',
      }}
      fetch={(api, limit, offset, filters) => {
        return api
          .getCollections({
            limit,
            offset,
            searchQuery: filters.searchQuery,
            owner,
          })
          .then(res => ({ items: res.collections, total: res.total }));
      }}
      filterPanelProps={{
        ...filterPanelProps,
        mode: 'collections',
      }}
      renderListItem={collection => (
        <CollectionListItem collection={collection} />
      )}
      renderGridItem={collection => (
        <CollectionsGridItem collection={collection} />
      )}
      title={total => t('common.collections', { count: total })}
      searchPlaceholder={t('collectionsPage.search.label')}
      emptyMessage={t('common.collections', { count: 0 })}
      getKey={collection => collection.id}
    />
  );
};
