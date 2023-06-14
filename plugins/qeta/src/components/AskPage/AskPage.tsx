import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

import { AskForm } from '../AskForm/AskForm';
import { useParams } from 'react-router-dom';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';

export const AskPage = () => {
  const { id } = useParams();
  return (
    <Content className="qetaAskPage">
      <ContentHeader title={id ? 'Edit question' : 'Ask question'}>
        <BackToQuestionsButton />
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
