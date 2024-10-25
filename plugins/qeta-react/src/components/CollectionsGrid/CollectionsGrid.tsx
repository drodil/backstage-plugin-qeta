import React, { useEffect } from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { CollectionsGridContent } from './CollectionsGridContent';
import { useQetaApi, useTranslation } from '../../hooks';

export const CollectionsGrid = () => {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const collectionsPerPage = 20;

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(api => {
    return api.getCollections({
      limit: collectionsPerPage,
      offset: (page - 1) * collectionsPerPage,
    });
  }, []);

  useEffect(() => {
    if (response) {
      setPageCount(Math.ceil(response.total / collectionsPerPage));
    }
  }, [response, collectionsPerPage]);

  return (
    <Box className="qetaCollectionsGrid">
      <Grid container justifyContent="space-between" />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h6" className="qetaPostsContainerQuestionCount">
            {t('common.collections', { count: response?.total ?? 0 })}
          </Typography>
        </Grid>
      </Grid>
      <CollectionsGridContent
        loading={loading}
        error={error}
        response={response}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </Box>
  );
};
