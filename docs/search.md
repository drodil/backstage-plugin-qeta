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

In the new frontend system, the Q&A search result item is registered automatically when `@drodil/backstage-plugin-qeta` is added to your app features.

## Custom Routes

If you have mounted the Qeta plugin to a custom route in your application, you must configure the `qeta.route` setting to ensure that search results link to the correct location:

```yaml
# app-config.yaml
qeta:
  route: 'custom-route' # Use your custom route instead of the default 'qeta'
```

This ensures that indexed search results will generate URLs like `/custom-route/questions/123` instead of the default `/qeta/questions/123`.

**Note:** This configuration must match the route where you mounted the Qeta plugin in your frontend application.
