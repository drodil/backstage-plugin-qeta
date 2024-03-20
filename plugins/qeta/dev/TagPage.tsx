import { Content, Page } from '@backstage/core-components';
import { Container } from '@material-ui/core';
import { QuestionsContainer } from '../src';
import React from 'react';

export const TagPage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Container>
          <QuestionsContainer tags={['tag1', 'tag2']} showTitle showAskButton />
        </Container>
      </Content>
    </Page>
  );
};
