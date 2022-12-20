# Setup

## Backend

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @drodil/backstage-plugin-qeta-backend
```

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

## Frontend

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @drodil/backstage-plugin-qeta
```

Expose the questions page:

```ts
// packages/app/src/App.tsx
import { QetaPage } from '@drodil/backstage-plugin-qeta';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/qeta" element={<QetaPage />} />
    // ...
  </FlatRoutes>
);
```

An interface for Q&A is now available at `/qeta`.
