import { Content, Header, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import {
  SearchBar,
  SearchContextProvider,
  SearchResult,
} from '@backstage/plugin-search-react';
import { QetaSearchResultListItem } from '../src';

export const searchPage = (
  <Page themeId="home">
    <Header title="Search" />
    <SearchContextProvider>
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <SearchBar />
          </Grid>
          <Grid item xs={9}>
            <SearchResult>
              <QetaSearchResultListItem />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </SearchContextProvider>
  </Page>
);
