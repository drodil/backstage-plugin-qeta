import { Content, Page } from '@backstage/core-components';
import { PostsContainer } from '@drodil/backstage-plugin-qeta-react';
import { Container } from '@material-ui/core';

export const TagPage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Container>
          <PostsContainer tags={['tag1', 'tag2']} showTitle showAskButton />
        </Container>
      </Content>
    </Page>
  );
};
