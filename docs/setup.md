# Setup

## Backend

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @drodil/backstage-plugin-qeta-backend
```

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
  return createRouter({
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

## New Backend System

The qeta backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
+ import { qetaPlugin } from '@drodil/backstage-plugin-qeta-backend';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(qetaPlugin());
  backend.start();
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
    <Route path="/qeta" element={<QetaPage title="Questions" />} />
    // ...
  </FlatRoutes>
);
```

Add the navigation in the frontend:

```ts
// packages/app/src/components/Root/Root.tsx
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
// ...
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    // ...
    <SidebarItem icon={LiveHelpIcon} to="qeta" text="Q&A" />
    // ...
  </SidebarPage>
);
```

An interface for Q&A is now available at `/qeta`.

QetaPage also takes optional properties if you want to change the page title/subtitle/elements shown in the header.

### Adding questions to entity page

You can also add questions list to any entity page. This will render questions related to that entity. First
create the questions component:

```ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { QuestionsContainer } from '@drodil/backstage-plugin-qeta';

export const QetaContent = () => {
  const { entity } = useEntity();

  return (
    <Container>
      <QuestionsContainer entity={stringifyEntityRef(entity)} showTitle />
    </Container>
  );
};
```

Then add it to your entity page:

```ts
// EntityPage.tsx
<EntityLayout.Route path="/qeta" title="Q&A">
    <QetaContent />
</EntityLayout.Route>,
```

## Importing content from another system

You can use the backend API to import content via the question, answer, and comment endpoints. If you set `allowMetadataInput` to `true` in your config, you can also pass in the `created` and `user` fields in to preserve this metadata from another system. For POST requests, you can pass these as keys in the JSON payload. For GET requests, you can pass the username with a `x-qeta-user` header.
