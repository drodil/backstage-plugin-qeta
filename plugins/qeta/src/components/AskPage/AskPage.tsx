import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

import { AskForm } from '../AskForm/AskForm';
import { useParams } from 'react-router-dom';
import { formatEntityName } from '../../utils/utils';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';

export const AskPage = () => {
  const { id } = useParams();
  const params = new URLSearchParams(window.location.search);
  const entity = params.get('entity') ?? undefined;
  let title;
  if (id) {
    title = 'Edit question';
  } else if (entity) {
    title = `Ask a question about ${formatEntityName(entity)}`;
  } else {
    title = 'Ask question';
  }

  return (
    <Content className="qetaAskPage">
      <ContentHeader title={title}>
        <BackToQuestionsButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <AskForm id={id} entity={entity} />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
