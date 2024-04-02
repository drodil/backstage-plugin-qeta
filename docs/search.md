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
