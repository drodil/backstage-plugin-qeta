import { Content, Page } from '@backstage/core-components';
import { PostsContainer } from '@drodil/backstage-plugin-qeta-react';
import { Container } from '@material-ui/core';

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
