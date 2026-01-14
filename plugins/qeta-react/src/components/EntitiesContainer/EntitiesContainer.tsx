import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { QetaEntityContainer } from '../QetaEntityContainer/QetaEntityContainer';
import { EntityListItem } from './EntityListItem';
import { EntitiesGridItem } from './EntitiesGridItem';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  CommonFilterPanelProps,
  EntityFilters,
} from '../FilterPanel/FilterPanel';
import { qetaTranslationRef } from '../../translation';
import { ViewType } from '../ViewToggle/ViewToggle';

export const EntitiesContainer = (props: {
  filterPanelProps?: CommonFilterPanelProps;
  defaultView?: ViewType;
}) => {
  const { filterPanelProps, defaultView } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <QetaEntityContainer<EntityResponse, EntityFilters>
      prefix="entities"
      defaultPageSize={24}
      defaultView={defaultView}
      initialFilters={{
        order: 'desc',
        orderBy: 'postsCount',
        searchQuery: '',
      }}
      fetch={(api, limit, offset, filters) => {
        return api
          .getEntities({
            limit,
            offset,
            searchQuery: filters.searchQuery,
            order: filters.order,
            orderBy: filters.orderBy,
          })
          .then(res => ({ items: res.entities, total: res.total }));
      }}
      filterPanelProps={{
        ...filterPanelProps,
        mode: 'entities',
      }}
      renderListItem={entity => <EntityListItem entity={entity} />}
      renderGridItem={entity => <EntitiesGridItem entity={entity} />}
      title={total => t('entitiesPage.entities', { count: total })}
      searchPlaceholder={t('entitiesPage.search.label')}
      emptyMessage={t('entitiesPage.entities', { count: 0 })}
      getKey={item => item.id}
    />
  );
};
