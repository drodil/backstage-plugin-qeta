import React from 'react';
import { CustomHomepageGrid } from '@backstage/plugin-home';
import { QuestionTableCard } from '../src/plugin';
import { Content, Page } from '@backstage/core-components';

export const HomePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <CustomHomepageGrid>
          <QuestionTableCard />
        </CustomHomepageGrid>
      </Content>
    </Page>
  );
};
