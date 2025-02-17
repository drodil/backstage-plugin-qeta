import React from 'react';
import { Content, Page } from '@backstage/core-components';
import { PostsTable } from '@drodil/backstage-plugin-qeta-react';
import { Card, CardContent } from '@material-ui/core';

export const TablePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Card>
          <CardContent>
            <PostsTable />
          </CardContent>
        </Card>
      </Content>
    </Page>
  );
};
