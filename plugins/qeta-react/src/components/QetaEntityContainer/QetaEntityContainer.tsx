import {
  Box,
  Collapse,
  Button,
  Grid,
  GridProps,
  Typography,
  Card,
  Divider,
} from '@material-ui/core';
import { WarningPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FilterList from '@material-ui/icons/FilterList';
import { useInfiniteScroll } from 'infinite-scroll-hook';

import {
  useQetaEntities,
  QetaEntitiesProps,
} from '../../hooks/useQetaEntities';
import { QetaGridHeader } from '../Utility/QetaGridHeader';
import {
  FilterPanel,
  CommonFilterPanelProps,
  Filters,
} from '../FilterPanel/FilterPanel';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { qetaTranslationRef } from '../../translation';
import { ViewToggle, ViewType } from '../ViewToggle/ViewToggle';
import {
  QetaIdEntity,
  UserResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Fragment, useState } from 'react';

export type QetaEntityContainerProps<T, F extends Filters> = QetaEntitiesProps<
  T,
  F
> & {
  title:
    | string
    | React.ReactNode
    | ((total: number) => string | React.ReactNode);
  searchPlaceholder?: string;
  renderGridItem?: (item: T, utils: { retry: () => void }) => React.ReactNode;
  renderListItem?: (item: T, utils: { retry: () => void }) => React.ReactNode;
  filterPanelProps?: CommonFilterPanelProps;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  headerButtons?:
    | React.ReactNode
    | ((utils: { retry: () => void }) => React.ReactNode);
  getKey?: (item: T) => string | number;
  gridItemProps?: GridProps;
  defaultView?: ViewType;
};

export function QetaEntityContainer<
  T extends QetaIdEntity | UserResponse,
  F extends Filters,
>({
  title,
  searchPlaceholder,
  renderGridItem,
  renderListItem,
  filterPanelProps,
  emptyState,
  headerButtons,
  getKey,
  gridItemProps,
  defaultView = 'grid',
  ...hookProps
}: QetaEntityContainerProps<T, F>) {
  const [view, setView] = useState<ViewType>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedView = localStorage.getItem(
        `qeta-${hookProps.prefix}-view`,
      ) as ViewType;
      if (savedView) {
        return savedView;
      }
    }
    return defaultView;
  });

  const onSetView = (v: ViewType) => {
    setView(v);
    localStorage.setItem(`qeta-${hookProps.prefix}-view`, v);
  };

  const {
    items,
    loading,
    error,
    hasMore,
    total,
    showFilterPanel,
    setShowFilterPanel,
    onSearchQueryChange,
    onFilterChange,
    filters,
    loadNextPage,
    retry,
  } = useQetaEntities({ ...hookProps, getKey });

  const { t } = useTranslationRef(qetaTranslationRef);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: !hasMore || !!error || loading,
    onLoadMore: async () => {
      if (loadNextPage) {
        loadNextPage();
      }
    },
    offset: '800px',
  });

  const resolvedTitle = typeof title === 'function' ? title(total) : title;

  return (
    <Box>
      <QetaGridHeader
        title={resolvedTitle}
        searchBarLabel={searchPlaceholder ?? t('common.search')}
        loading={loading}
        onSearch={onSearchQueryChange}
        buttons={
          <>
            {typeof headerButtons === 'function'
              ? headerButtons({ retry })
              : headerButtons}
            {filterPanelProps && (
              <Button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                startIcon={<FilterList />}
              >
                {t('filterPanel.filterButton')}
              </Button>
            )}
          </>
        }
        rightElement={
          renderListItem &&
          renderGridItem && <ViewToggle view={view} onChange={onSetView} />
        }
      />

      {filterPanelProps && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<F>
            onChange={onFilterChange}
            filters={filters}
            mode={filterPanelProps.mode ?? 'posts'}
            {...filterPanelProps}
          />
        </Collapse>
      )}

      {loading && items.length === 0 && <LoadingGrid />}

      {error && (
        <WarningPanel severity="error" title={t('common.error')}>
          {error?.message}
        </WarningPanel>
      )}

      {!loading && !error && items.length === 0 && emptyState}

      {items.length > 0 && (
        <>
          {view === 'grid' && renderGridItem && (
            <Grid container spacing={3} direction="row" alignItems="stretch">
              {items.map((item, index) => (
                <Grid
                  item
                  xs={12}
                  md={12}
                  lg={6}
                  key={getKey ? getKey(item) : index}
                  {...gridItemProps}
                >
                  {renderGridItem(item, { retry })}
                </Grid>
              ))}
            </Grid>
          )}
          {view === 'list' && renderListItem && (
            <Card>
              <Grid container direction="column">
                {items.map((item, index) => (
                  <Fragment
                    key={getKey ? getKey(item) : (item as any).id || index}
                  >
                    {renderListItem(item, { retry })}
                    {index < items.length - 1 && <Divider />}
                  </Fragment>
                ))}
              </Grid>
            </Card>
          )}

          {!renderGridItem && !renderListItem && (
            <Typography variant="body1">
              No renderer provided for current view.
            </Typography>
          )}

          <div
            ref={sentryRef as any}
            style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
          >
            {loading && <LoadingGrid />}
          </div>
        </>
      )}
    </Box>
  );
}
