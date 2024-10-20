import React from 'react';
import { ContentHeader } from '@backstage/core-components';
import { AskQuestionButton } from '@drodil/backstage-plugin-qeta-react';
import { TopRankingUsers } from '@drodil/backstage-plugin-qeta-react';
import { GlobalStatsContent } from './GlobalStatsContent';
import { Grid } from '@material-ui/core';

export const StatisticsPage = () => {
  return (
    <>
      <ContentHeader title="Statistics">
        <AskQuestionButton />
      </ContentHeader>
      <Grid container>
        <Grid item xs={12}>
          <GlobalStatsContent />
        </Grid>
        <Grid item xs={12}>
          <TopRankingUsers limit={10} />
        </Grid>
      </Grid>
    </>
  );
};
