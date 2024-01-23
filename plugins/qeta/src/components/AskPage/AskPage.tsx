import { Content, ContentHeader, InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

import { AskForm } from '../AskForm/AskForm';
import { useParams, useSearchParams } from 'react-router-dom';
import { BackToQuestionsButton } from '../Buttons/BackToQuestionsButton';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';

export const AskPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity') ?? undefined;
  const entityPage = searchParams.get('entityPage') === 'true';
  let title;
  if (id) {
    title = 'Edit question';
  } else if (entity) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const representation = useEntityPresentation(entity);
    title = `Ask a question about ${representation.primaryTitle}`;
  } else {
    title = 'Ask question';
  }

  return (
    <Content className="qetaAskPage">
      <ContentHeader title={title}>
        <BackToQuestionsButton entityPage={entityPage} />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <AskForm id={id} entity={entity} entityPage={entityPage} />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
