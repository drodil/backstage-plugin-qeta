# Integration with `@backstage/plugin-search`

> [!WARNING]  
> This is going to be deprecated. Please use the `@drodil/backstage-plugin-search-backend-module-qeta` instead

Enable questions indexing in the search engine by the following changes. See
[setup](setup.md) first to integrate the plugin with backstage instance.

**packages/backend/src/index.ts**

```ts
apiRouter.use('/search', await search(searchEnv, qetaEnv.database));
```

**backend/src/plugins/search.ts**

```typescript
import { PluginDatabaseManager } from '@backstage/backend-common';
import { QetaCollatorFactory } from '@drodil/backstage-plugin-qeta-backend';

export default async function createPlugin(
  env: PluginEnvironment,
  qetaDatabase: PluginDatabaseManager,
): Promise<Router> {
  const indexBuilder = new IndexBuilder({
    logger: env.logger,
    searchEngine,
  });

  indexBuilder.addCollator({
    schedule,
    factory: QetaCollatorFactory.fromConfig(env.config, {
      logger: env.logger,
      database: qetaDatabase,
    }),
  });

  const { scheduler } = await indexBuilder.build();
  scheduler.start();
  // ...
}
```
