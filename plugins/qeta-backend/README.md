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
import { createRouter, DatabaseQetaStore } from '@internal/plugin-qeta-backend';
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
const qetaEnv = useHotMemoize(module, () => createEnv('qeta'));
apiRouter.use('/qeta', await qeta(qetaEnv));
```
