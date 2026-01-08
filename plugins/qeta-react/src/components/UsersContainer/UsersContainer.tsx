import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { QetaEntityContainer } from '../QetaEntityContainer/QetaEntityContainer';
import { UserListItem } from './UserListItem';
import { UsersGridItem } from './UsersGridItem';
import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import {
  CommonFilterPanelProps,
  UserFilters,
} from '../FilterPanel/FilterPanel';
import { qetaTranslationRef } from '../../translation';
import { ViewType } from '../ViewToggle/ViewToggle';

export const UsersContainer = (props: {
  filterPanelProps?: CommonFilterPanelProps;
  defaultView?: ViewType;
}) => {
  const { filterPanelProps, defaultView } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <QetaEntityContainer<UserResponse, UserFilters>
      prefix="users"
      defaultPageSize={24}
      defaultView={defaultView}
      initialFilters={{
        order: 'desc',
        orderBy: 'totalPosts',
        searchQuery: '',
      }}
      fetch={(api, limit, offset, filters) => {
        return api
          .getUsers({
            limit,
            offset,
            searchQuery: filters.searchQuery,
          })
          .then(res => ({ items: res.users, total: res.total }));
      }}
      filterPanelProps={{
        ...filterPanelProps,
        mode: 'users',
      }}
      renderListItem={user => <UserListItem user={user} />}
      renderGridItem={user => <UsersGridItem user={user} />}
      title={total => t('usersPage.users', { count: total })}
      searchPlaceholder={t('usersPage.search.label')}
      emptyMessage={t('usersPage.users', { count: 0 })}
      getKey={user => user.userRef}
    />
  );
};
