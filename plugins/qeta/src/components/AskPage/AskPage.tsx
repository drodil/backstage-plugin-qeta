import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { LinkButton } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

import { AskForm } from '../AskForm/AskForm';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import { useParams } from 'react-router-dom';

export const AskPage = () => {
  const { id } = useParams();
  return (
    <Content>
      <ContentHeader title={id ? 'Edit question' : 'Ask question'}>
        <LinkButton to="/qeta" startIcon={<HomeOutlined />}>
          Back to questions
        </LinkButton>
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
