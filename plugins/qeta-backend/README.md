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

> [!IMPORTANT]  
> If you are using the `@drodil/backstage-plugin-search-backend-module-qeta` for search collator, please pass also
> `TokenManager` to the `createRouter` method.

Now add this plugin to your packages/backend/src/index.ts:

```ts
import qeta from './plugins/qeta';
const qetaEnv = useHotMemoize(module, () => createEnv('qeta'));
apiRouter.use('/qeta', await qeta(qetaEnv));
```

## New Backend System

The qeta backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@drodil/backstage-plugin-qeta-backend'));
  backend.start();
```

### MCP actions

The backend registers `ask-question`, `write-article`, `post-link`, and
`answer-question` actions. The post creation actions accept optional `draft`
and `collectionId` inputs to save the post as a draft and add it to a
collection. They also support tags, catalog entities, and image files as
`{ base64, mimeType }` values. `headerImage` accepts either a URL string or the
same base64 image object. `write-article` also accepts a related
URL. For `post-link`, the required `content` URL is also stored as the link's
destination URL. `answer-question` accepts the same base64 image objects for
answer attachments.

Read actions include `get-posts`, `get-tags`, and `get-collections`.
`get-posts` accepts `favorite: true` to return only posts favorited by the
current user. `add-post-to-collection` can add an existing post to a collection.

### Integration with `@backstage/plugin-search`

> [!WARNING]  
> This is going to be deprecated. Please use the `@drodil/backstage-plugin-search-backend-module-qeta` instead

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
