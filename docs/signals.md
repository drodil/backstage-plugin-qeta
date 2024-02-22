# Integration with signals

This plugin integrates with the [`@backstage/plugin-signals`](https://github.com/backstage/backstage/tree/master/plugins/signals)
plugin. It provides real time updates to frontend from the backend.

At the moment, only question and answer statistics are updated in real time.

To integrate with signals, install `signals-backend` and pass the signal service
to the `createRouter` method in options.

```ts
export default async function createPlugin({
  logger,
  database,
  identity,
  config,
  signalService,
}: PluginEnvironment) {
  const db = await DatabaseQetaStore.create({
    database: database,
  });
  return createRouter({
    logger,
    database: db,
    identity,
    config,
    signalService,
  });
}
```
