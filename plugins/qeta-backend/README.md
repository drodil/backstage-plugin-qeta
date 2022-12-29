# qeta-backend

Welcome to the qeta-backend backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/qeta-backend](http://localhost:3000/qeta-backend).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Add to your application

### Adding backend

Create new file to packages/backend/src/plugins/qeta.ts:

```ts
import {
  createRouter,
  DatabaseQetaStore,
} from '@drodil/backstage-plugin-qeta-backend';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  identity,
  config,
}: PluginEnvironment) {
  const db = await DatabaseQetaStore.create({
    database: database,
  });
  return await createRouter({
    logger,
    database: db,
    identity,
    config,
  });
}
```

Now add this plugin to your packages/backend/src/index.ts:

```ts
import qeta from './plugins/qeta';
const qetaEnv = useHotMemoize(module, () => createEnv('qeta'));
apiRouter.use('/qeta', await qeta(qetaEnv));
```

### Integration with `@backstage/plugin-search`

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
