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
import { QetaPagination } from '../Utility';
import { qetaTranslationRef } from '../../translation';
import { ViewToggle, ViewType } from '../ViewToggle/ViewToggle';
import {
  QetaIdEntity,
  UserResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useUserSettings } from '../../hooks/useUserSettings';

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
  const { settings, getSetting, setSetting, isLoaded } = useUserSettings();
  const [view, setView] = useState<ViewType>(defaultView);

  useEffect(() => {
    if (isLoaded) {
      const savedView = settings.viewType[hookProps.prefix];
      if (savedView) {
        setView(savedView);
      }
    }
  }, [isLoaded, settings.viewType, hookProps.prefix]);

  const onSetView = (v: ViewType) => {
    setView(v);
    const currentViewTypes = getSetting('viewType');
    setSetting('viewType', {
      ...currentViewTypes,
      [hookProps.prefix]: v,
    });
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
    page,
    loadNextPage,
    onPageChange,
    onPageSizeChange,
    pageSize,
    retry,
  } = useQetaEntities<T, F>({
    ...hookProps,
    getKey,
    usePagination: settings.usePagination,
    defaultPageSize: settings.usePagination ? 10 : hookProps.defaultPageSize,
  });

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.usePagination) {
      topRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [page, settings.usePagination]);

  const { t } = useTranslationRef(qetaTranslationRef);

  const { containerRef: sentryRef } = useInfiniteScroll({
    shouldStop: settings.usePagination || !hasMore || !!error || loading,
    onLoadMore: async () => {
      if (loadNextPage) {
        loadNextPage();
      }
    },
    offset: '800px',
  });

  const resolvedTitle = typeof title === 'function' ? title(total) : title;

  return (
    <div ref={topRef}>
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

        {loading && (items?.length === 0 || settings.usePagination) && (
          <LoadingGrid />
        )}

        {error && (
          <WarningPanel severity="error" title={t('common.error')}>
            {error?.message}
          </WarningPanel>
        )}

        {!loading && !error && items?.length === 0 && emptyState}

        {items?.length > 0 && (!loading || !settings.usePagination) && (
          <>
            {view === 'grid' && renderGridItem && (
              <Grid container spacing={3} direction="row" alignItems="stretch">
                {items.map((item, index) => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    xl={4}
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
                {items.map((item, index) => (
                  <Fragment
                    key={getKey ? getKey(item) : (item as any).id || index}
                  >
                    {renderListItem(item, { retry })}
                    {index < items.length - 1 && <Divider />}
                  </Fragment>
                ))}
              </Card>
            )}

            {!renderGridItem && !renderListItem && (
              <Typography variant="body1">
                No renderer provided for current view.
              </Typography>
            )}

            <div
              ref={!settings.usePagination ? (sentryRef as any) : undefined}
              style={{
                width: '100%',
                marginTop: '10px',
                textAlign: 'center',
              }}
            >
              {loading && <LoadingGrid />}
            </div>
          </>
        )}

        {settings.usePagination && total > pageSize && (
          <QetaPagination
            pageSize={pageSize}
            handlePageSizeChange={e =>
              onPageSizeChange(e.target.value as number)
            }
            handlePageChange={(_e, p) => onPageChange(p)}
            page={page}
            pageCount={Math.ceil(total / pageSize)}
          />
        )}
      </Box>
    </div>
  );
}
