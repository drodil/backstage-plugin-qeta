# Integration with `@backstage/plugin-search`

Enable questions indexing in the search engine:

```typescript
import { QetaCollatorFactory } from '@drodil/backstage-plugin-qeta-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const indexBuilder = new IndexBuilder({
    logger: env.logger,
    searchEngine,
  });

  indexBuilder.addCollator({
    schedule,
    factory: QetaCollatorFactory.fromConfig(env.config, {
      logger: env.logger,
    }),
  });

  const { scheduler } = await indexBuilder.build();
  scheduler.start();
  // ...
}
```
