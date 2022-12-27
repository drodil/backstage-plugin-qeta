import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Button, Grid } from '@material-ui/core';
import React from 'react';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { AskForm } from './AskForm';
import HomeOutlined from '@material-ui/icons/HomeOutlined';

export const AskPage = () => {
  return (
    <Content>
      <ContentHeader title="Ask question">
        <Button href="/qeta" startIcon={<HomeOutlined />}>
          Back to questions
        </Button>
      </ContentHeader>
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
