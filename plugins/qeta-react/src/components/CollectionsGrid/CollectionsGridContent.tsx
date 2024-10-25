import { CollectionsResponse } from '@drodil/backstage-plugin-qeta-common';
import React, { useEffect, useRef, useState } from 'react';
import { Progress, WarningPanel } from '@backstage/core-components';
import { Box, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { CollectionsGridItem } from './CollectionsGridItem';
import { useTranslation } from '../../hooks';

export const CollectionsGridContent = (props: {
  loading: boolean;
  error: any;
  response?: CollectionsResponse;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
}) => {
  const { loading, error, response, onPageChange, page, pageCount } = props;
  const [initialLoad, setInitialLoad] = useState(true);
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad, loading]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView();
    }
    onPageChange(value);
  };

  if (loading && initialLoad) {
    return <Progress />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel
        severity="error"
        title={t('postsList.errorLoading', { itemType: 'collections' })}
      >
        {error?.message}
      </WarningPanel>
    );
  }

  if (
    initialLoad &&
    (!response.collections || response.collections.length === 0)
  ) {
    return null;
  }

  return (
    <div ref={gridRef}>
      <Box sx={{ mt: 2 }} className="qetaCollectionsGrid">
        <Grid
          container
          direction="row"
          alignItems="stretch"
          style={{ marginTop: '1rem' }}
        >
          {response.collections.map(p => {
            return (
              <Grid item xs={12} md={4} lg={3} key={p.id}>
                <CollectionsGridItem collection={p} />
              </Grid>
            );
          })}
        </Grid>
        <Grid container justifyContent="center" style={{ marginTop: '2rem' }}>
          <Pagination
            page={page}
            onChange={handlePageChange}
            count={pageCount}
            size="large"
            variant="outlined"
            className="qetaPostListPagination"
            showFirstButton
            showLastButton
          />
        </Grid>
      </Box>
    </div>
  );
};
