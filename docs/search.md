# Integration with `@backstage/plugin-search`

Enable questions indexing in the search engine by the following changes. See
[setup](setup.md) first to integrate the plugin with backstage instance.

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/search-backend'));
backend.add(import('@drodil/backstage-plugin-search-backend-module-qeta'));

backend.start();
```

Displaying search results:

```tsx
// packages/app/src/components/search/SearchPage.tsx

import { QetaSearchResultListItem } from '@drodil/backstage-plugin-qeta';
import {
  DefaultResultListItem,
  SearchBar,
  SearchContextProvider,
  SearchResult,
} from '@backstage/plugin-search-react';

export const searchPage = (
  <Page themeId="home">
    <SearchResult>
      {({ results }) => (
        <List>
          {results.map(result => {
            switch (result.type) {
              case 'qeta':
                return (
                  <QetaSearchResultListItem
                    key={result.document.location}
                    result={result.document}
                    highlight={result.highlight}
                  />
                );
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
  </Page>
);
```
