import React from 'react';
import { Content, Page } from '@backstage/core-components';
import { QuestionsTable } from '@drodil/backstage-plugin-qeta-react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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
