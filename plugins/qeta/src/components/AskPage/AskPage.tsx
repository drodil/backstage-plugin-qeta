import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { AskForm } from './AskForm';

export const AskPage = () => {
  return (
    <Content>
      <ContentHeader title="Ask question" />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <AskForm />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
