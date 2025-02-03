import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { Grid, List } from '@material-ui/core';
import {
  DefaultResultListItem,
  SearchBar,
  SearchContextProvider,
  SearchResult,
} from '@backstage/plugin-search-react';

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
              {({ results }) => (
                <List>
                  {results.map(result => {
                    switch (result.type) {
                      default:
                        return (
                          <DefaultResultListItem
                            key={result.document.location}
                            result={result.document}
                            highlight={result.highlight}
                          />
                        );
                    }
                  })}
                </List>
              )}
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </SearchContextProvider>
  </Page>
);
