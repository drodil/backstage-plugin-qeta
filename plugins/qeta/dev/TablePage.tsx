import React from 'react';
import { Content, Page } from '@backstage/core-components';
import { QuestionsTable } from '../src/components/QuestionTableCard/QuestionsTable';
import { Card, CardContent } from '@material-ui/core';

export const TablePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Card>
          <CardContent>
            <QuestionsTable />
          </CardContent>
        </Card>
      </Content>
    </Page>
  );
};
