import React from 'react';
import { Content, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { TopRankingUsers } from '../src/components/Statistics/TopRankingUsersCard';

export const StatisticsPage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Grid container spacing={2}>
          <TopRankingUsers />
        </Grid>
      </Content>
    </Page>
  );
};
