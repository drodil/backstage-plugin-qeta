import { Content, Page } from '@backstage/core-components';
import Container from '@mui/material/Container';
import { PostsContainer } from '@drodil/backstage-plugin-qeta-react';
import React from 'react';

export const ComponentPage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Container>
          <PostsContainer
            entity="component:default/test-component"
            showTitle
            showAskButton
            type="question"
          />
        </Container>
      </Content>
    </Page>
  );
};
