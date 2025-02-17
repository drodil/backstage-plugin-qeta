import React from 'react';
import { CustomHomepageGrid } from '@backstage/plugin-home';
import { PostsTableCard } from '../src/plugin';
import { Content, Page } from '@backstage/core-components';

export const HomePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <CustomHomepageGrid>
          <PostsTableCard />
        </CustomHomepageGrid>
      </Content>
    </Page>
  );
};
