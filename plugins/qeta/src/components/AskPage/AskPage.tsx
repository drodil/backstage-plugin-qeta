import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Button, Grid } from '@material-ui/core';
import React from 'react';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { AskForm } from '../AskForm/AskForm';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useParams } from 'react-router-dom';

export const AskPage = () => {
  const { id } = useParams();
  return (
    <Content>
      <ContentHeader title={id ? 'Edit question' : 'Ask question'}>
        <Button href="/qeta" startIcon={<HomeOutlined />}>
          Back to questions
        </Button>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <AskForm id={id} />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
