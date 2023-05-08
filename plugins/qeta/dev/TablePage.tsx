import React from 'react';
import { Content, Page } from '@backstage/core-components';
import { QuestionsTable } from '../src/components/QuestionTableCard/QuestionsTable';

export const TablePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <QuestionsTable />
      </Content>
    </Page>
  );
};
